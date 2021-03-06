/**
 *  You can use inline styles or classNames inside your callbacks
 */

import React, {Component} from 'react'
import redraft from 'redraft'

var Prism = require('prismjs');

const handlePrismRenderer = (syntax, code)=>{
  const formattedCode =  Prism.highlight(code, Prism.languages.javascript, 'javascript');
  return {__html: formattedCode }
}

const styles = {
  code: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    fontSize: 16,
    padding: 2,
  },
  codeBlock: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    fontSize: 16,
    padding: 20,
  },
};

function Pre({className, children, data}){

  let el = React.useRef(null);
  const [code, setCode] = React.useState(null)

  React.useEffect( () => {
    setCode(handlePrismRenderer(data.syntax, el.current.innerHTML ))
  }, [] )

  return <div>
          <div ref={el} style={{display:'none'}}>
            {children}
          </div>
          
          { code && <pre 
              className="graf graf--code"
              dangerouslySetInnerHTML={code}
            />
          }
         </div>
}

// just a helper to add a <br /> after a block
const addBreaklines = (children) => children.map(child => [child, <br />]);


function getImageUrl (url, props) {
  if (!url) return 
  if (url.includes("://")) return url
  return `${props.domain}${url}`
}
/**
 * Define the renderers
 */
function renderers(props) {

  return {
    /**
     * Those callbacks will be called recursively to render a nested structure
     */
    inline: {
      // The key passed here is just an index based on rendering order inside a block
      BOLD: (children, { key }) => <strong key={key}>{children}</strong>,
      ITALIC: (children, { key }) => <em key={key}>{children}</em>,
      UNDERLINE: (children, { key }) => <u key={key}>{children}</u>,
      /*CODE: (children, { key }) => <span 
        key={key} 
        dangerouslySetInnerHTML={handlePrismRenderer(children)} 
      />,*/
    },
    /**
     * Blocks receive children and depth
     * Note that children are an array of blocks with same styling,
     */
    blocks: {

      
      unstyled: (children, { keys }) => {
        return children.map(
          (o, i)=> ( <p key={keys[i]} className="graf graf--p">{o}</p>) 
        )
      },
      blockquote: (children, { keys }) => <blockquote 
                                            key={keys[0]} 
                                            className="graf graf--blockquote">
                                  {addBreaklines(children)}
                                </blockquote>,
      'header-one': (children, { keys }) => <h1 key={keys[0]} className="graf graf--h2">{children}</h1>,
      'header-two': (children, { keys }) => <h2 key={keys[0]} className="graf graf--h3">{children}</h2>,
      // You can also access the original keys of the blocks
      'code-block': (children, { keys, data }) => {
        return <Pre className="graf graf--code" data={data}>
                  {children}
               </Pre>
               
               {/*<pre className="graf graf--code" 
                    //style={styles.codeBlock} 
                    key={keys[0]} 
                    //dangerouslySetInnerHTML={handlePrismRenderer(data.syntax, children)}
                  >{children}</pre>*/}
              },
      // or depth for nested lists
      'unordered-list-item': (children, { depth, keys }) => <ul key={keys[keys.length - 1]} className={`ul-level-${depth}`}>
                                                              {children.map(child => <li className="graf graf--insertunorderedlist">
                                                                {child}
                                                              </li>)}
                                                            </ul>,
      'ordered-list-item': (children, { depth, keys }) => <ol key={keys.join('|')} className={`ol-level-${depth}`}>{
        children.map((child, index) => <li key={keys[index]} className="graf graf--insertorderedlist">
          {child}
        </li>)
      }</ol>,

      'image': (children, {keys, data}) => {
        const data2 = data[0]
        const {url, aspect_ratio, caption} = data2

  
        if(!aspect_ratio){
          var height = "100%"
          var width  = "100%"
          var ratio  = "100%"
        }else{
          var { height, width, ratio} = aspect_ratio 
        }

        return  <figure  key={keys[0]} className="graf graf--figure">
                    <div>
                      <div className="aspectRatioPlaceholder is-locked" 
                        //style={{maxWidth: '1000px', maxHeight: `${height}px`}}
                        >
                        <div className="aspect-ratio-fill" 
                            style={{paddingBottom: `${ratio}%`}}>
                        </div>

                        <img src={getImageUrl(url, props)}
                          className="graf-image" 
                          width={width}
                          height={height}
                          contentEditable="false"/>
                      </div>

                    </div>


                    {
                      caption && 
                      caption != "type a caption (optional)"
                      && 

                      <figcaption className="imageCaption">
                        <span>
                          <span data-text="true">{children}</span>
                        </span>
                      </figcaption>
                    }

                </figure>
      },
      embed: (children, {keys, data})=>{

        const {provisory_text, type, embed_data } = data[0]
        const {images, title, media, provider_url, description, url } = embed_data

        return <div  key={keys[0]} className="graf graf--mixtapeEmbed">
                <span>
                  {
                    images[0].url ?
                      <a target="_blank" className="js-mixtapeImage mixtapeImage"
                        href={provisory_text}
                        style={{ backgroundImage: `url(${images[0].url})` }}>
                      </a> : null 
                  }
                  <a className="markup--anchor markup--mixtapeEmbed-anchor"
                    target="_blank"
                    href={provisory_text}>
                    <strong className="markup--strong markup--mixtapeEmbed-strong">
                      {title}
                    </strong>
                    <em className="markup--em markup--mixtapeEmbed-em">
                      {description}
                    </em>
                  </a>
                  {provider_url}
                </span>
              </div>

      },
      video: (children, {keys, data})=>{

        const {provisory_text, type, embed_data } = data[0]
        const {html} = embed_data
        
        return <figure  key={keys[0]} className="graf--figure graf--iframe graf--first" tabindex="0">
                  <div className="iframeContainer" dangerouslySetInnerHTML={
                            { __html: `${html}` }
                          }/>

                  {
                    provisory_text && 
                    provisory_text === "type a caption (optional)"
                    && 
                    <figcaption className="imageCaption">
                      <div className="public-DraftStyleDefault-block public-DraftStyleDefault-ltr">
                        <span>
                        <span>
                        {provisory_text}
                        </span>
                        </span>
                      </div>
                    </figcaption> 
                  }
              </figure>
      },
      'recorded-video': (children, {keys, data})=>{
        const {url, text} = data[0]

        return <figure  key={keys[0]} className="graf--figure graf--iframe graf--first" 
                tabindex="0">
                <div className="iframeContainer">
                  <video 
                    autoplay={false} 
                    style={{width:"100%" }}
                    controls={true} 
                    src={getImageUrl(url, props)}>
                  </video>
                </div>
                <figcaption className="imageCaption">
                  <div className="public-DraftStyleDefault-block public-DraftStyleDefault-ltr">
                    <span>
                    {text}
                    </span>
                  </div>
                </figcaption>
              </figure>
      },
      /*AppPackage: (children, { keys, data }) => {
        return <AppPackagePublicBlock 
                  data={data[0]} 
                  message={props.message}
                  displayAppBlockFrame={props.displayAppBlockFrame}
              />
      }*/
      // If your blocks use meta data it can also be accessed like keys
      //atomic: (children, { keys, data }) => children.map((child, i) => <Atomic key={keys[i]} {...data[i]} />),
    },
    /**
     * Entities receive children and the entity data
     */
    entities: {
      // key is the entity key value from raw
      LINK: (children, data, { key }) => 
      <a key={key} href={data.url} target="_blank">
        {children}
      </a>,
    },
    /**
     * Array of decorators,
     * Entities receive children and the entity data,
     * inspired by https://facebook.github.io/draft-js/docs/advanced-topics-decorators.html
     * it's also possible to pass a custom Decorator class that matches the [DraftDecoratorType](https://github.com/facebook/draft-js/blob/master/src/model/decorators/DraftDecoratorType.js)
     */
    /*decorators: [
      {
        // by default linkStrategy receives a ContentBlock stub (more info under Creating the ContentBlock)
        // strategy only receives first two arguments, contentState is yet not provided
        strategy: linkStrategy,
        // component - a callback as with other renderers
        // decoratedText a plain string matched by the strategy
        // if your decorator depends on draft-js contentState you need to provide convertFromRaw in redraft options
        component: ({ children, decoratedText }) => <a href={decoratedText}>{children}</a>,
      },
      new CustomDecorator(someOptions),
    ],*/
  }
}


export default class Renderer extends Component {

  /*static propTypes = {
    raw: PropTypes.object
  }*/

  renderWarning() {

    if(this.props.message && this.props.message.message.htmlContent){
      return <div dangerouslySetInnerHTML={
        {__html: this.props.message.message.htmlContent }
      }/>
    }else{
      return <div>---</div>;
    } 
  }

  render() {
    const { raw } = this.props;
    if (!raw) {
      return this.renderWarning();
    }
    const rendered = redraft(raw, renderers(this.props));
    // redraft returns a null if there's nothing to render
    if (!rendered) {
      return this.renderWarning();
    }
    return (
      <div>
        {rendered}
      </div>
    );
  }
}