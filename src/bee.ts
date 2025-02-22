import { run } from "./bee.exports";
import { B, Namings, internal, CreatedComponents, independent, Blocks } from "./global";
import { eventHandler, observeDependency } from "./helper-methods.export";
import { BeeComponentInstanceObject, UI } from "./ui";

/**
 * This is the main honeybee class
 */
export class Bee {
  // Holds a reference to the UI class
  UI: UI;
  // Component objects inherits from this class
  // Every component maintains its own state. The state object is a property of the
  // component's object. Component objects also has predefined methods and properties
  // of the component's class.

  ///ComponentObject: ComponentObjectObjects;

  // Component instance objects inherits from this class
  // An instance object is returned whenever you create a new component instance from
  // a component class
  ComponentInstanceObject: BeeComponentInstanceObject<any>;
  // Server side rendering comes with its own problems. 
  // Hydration is done to bring interactivity to the application.
  // WE DO NOT DO HYDRATION ON LOAD. WE HYDRATE ON DEMAND.
  // When app is server rendered with the `honeybee-server`,
  // value is set to true to allow hydrationon demand
  private isSelectiveRendering: boolean;
  // Selector holds info on selected node/component to hydrate
  private selector: any;
  // Raw data used in generating server side html code can be accesssed on client.
  // We keep such data here
  private externalData: { data: { [k: string]: { data: any } } };
  // Code modularization and access library reference
  // Almost as a router but serves many purpose
  // See the `import-for-web` library https:github.cpm/KBismark/import-for-web
  private _imex: any;

  constructor() {
    this.UI = new UI();
    //this.ComponentObject = BeeComponentObjects;
    this.ComponentInstanceObject = new BeeComponentInstanceObject;
    this.isSelectiveRendering = false;
    this.selector = null;
    let _ext = { data: {} };
    if ((window as any).HoneyBee) {
      _ext = (window as any).HoneyBee.externalData;
    }
    this.externalData = _ext;
  }
  // This is set to true when page is server rendered
  private isSSR: boolean = (window as any).HoneyBee ? (window as any).HoneyBee.isSSR : false;
  /**
   * Used for selecting independent components that needs to be hydrated after SSR.    
   * **----Internal method----**
   */
  private select(node: any, eventName: any) {
    const independentNode = getIndependentNode(node);
    // The pathname of the module where component was defined
    const path = independentNode.getAttribute('bee-path'),
      // Get the actual component's name 
      compName = independentNode.getAttribute('bee-N');
    // Store info on selected node and component
    (B as Bee).selector = {
      node: independentNode,
      iname: independentNode.getAttribute('bee-I'),
    };
    // Rencder selected component
    const clientRenderdNode = (B as Bee).UI.render(Namings[path + compName](/**No Initial Args */) /**No Args */);
    // Replace server rendered node with client rendered node
    independentNode.replaceWith(clientRenderdNode[internal].node);
    // Not selected any component for hydration yet, reset stuff to original
    (B as Bee).isSelectiveRendering = false;
    (B as Bee).selector = null;
  }
  /**
   * Creates the component UI. This is generated by the compiler by converting the JSX part of the defined components
   * @param htmlMethod A method that returns the static part of the component views
   * @param Setter 
   * @param dynamicNodes 
   * @param dependencies 
   * @param dynMethod 
   * @param comp 
   * 
   * This part is automaticlaly handled by the compiler.
   * It transpiles the JSX code in the JS/TS files into understandable `create()` calls
   */
  create(
    htmlMethod: () => string,
    Setter: Function,
    dynamicNodes: any,
    dependencies: any,
    dynMethod: Function,
    comp: any,
  ) {
    // Get the internal object of the componentr object 
    // this object is not accessible to outsiders
    const _internal_ = comp[internal];
    comp[internal] = null;
    // Get the component class from which to create this new component;s view/Ui
    const compClass = CreatedComponents.get(_internal_.fnId);
    // Set the component class up if it is the first time we are creating a conmponent instance from it
    compClass.setup(htmlMethod, Setter, dynamicNodes, dependencies, dynMethod, comp);
    // Set `independent` value if  component's class was defined as independent
    // Indedpendent components are components that are not affected by their parent components
    // They remain the same even if the state of their parent component changes
    // They render with their parent once only if they are not rendered already.
    if (compClass.isIndependent) {
      _internal_.independent = true;
    }
    if ((B as Bee).isSelectiveRendering && _internal_.independent) {// Is hydrating
      // Independent component prevents further rendering
      return independent;
    }
    // Get a clone of the component's static nodes
    const node = compClass.getTemplate();
    // Create the component's object and make it inherit all methods and properties
    // of its component class
    comp = Object.create(compClass.proto);
    // Set the internal object on the new object created
    comp[internal] = _internal_;
    // Initial arguments are ways to set some map some data with a component instance
    // even before it is rendered.
    // If `initArgs` was set, set on component's object.
    comp.initArgs = _internal_.InitArgs || comp.initArgs;
    _internal_.InitArgs = undefined;
    // Every created component instance has a unique id
    // This allows us to re-render the same component with its state
    // even after it was destroyed and detached from the DOM
    const id = _internal_.id;
    // We keep track of all component objects.
    // `Blocks` map all rendered components to their component's object
    Blocks.set(id, comp);
    // Run certain events like onCreation, onMount, onParentEffect, etc
    run(comp);
    // Set all dynamic attributes of the component's view/UI
    const kNdN = Setter.call(comp, _internal_.Args, node, eventHandler, id, dependencies, true);
    // Keep a reference of nodes that may require attribute updates in the future
    _internal_.keyed = kNdN[0];
    // Get all dynamic methods 
    // Calling these methods would return dynamic nodes to be inserted in our
    // view/UI to form the complete view/UI of the component
    _internal_.init_dyn = dynMethod(node);
    // Attribuites can only be update if their dependencies were set
    // Setting attribute dependencies help to only update affected parts of the view/UI
    // without any diffing algorithm
    // Info on attribuites that would need updates in the UI/view for any render cycle is kept here 
    const attrDeps = (_internal_.attrDeps = new Map());
    // Get the state object if exists
    const state = comp.state;
    let key: string, fn: any;
    if (state) {
      //  Observe state object's properties for changes
      // This observes for only the attributes that would need updates in the future (Those that had dependencies set)
      for (key in dependencies) {
        fn = dependencies[key];
        // Make state object reactive
        observeDependency(state, fn.$dep, attrDeps, { node: fn.key, attr: true, id: id, index: key });
      }
    }
    return node;
  }
}
/**
 * If I4W is not included, set a shim
 * We depend on the pathnames of the files in which components are defined.
 * `import-for-web` makes that easy but if user is not using import-for-web,
 * we use this workaround to solve some issues. this would also require the user 
 * to set the pathname of all the files they use in the app.
 * @example
 * I4W.pathname = 'name_of_file_or_module';
 */
if (typeof (window as any).I4W != 'undefined') {
  (Bee as any).prototype._imex = (window as any).I4W;
} else {
  (window as any).I4W = (Bee as any).prototype._imex = {
    pathname: '',
    getPath() {
      return this.pathname;
    },
    // This value indicates the global I4W objext is not original.
    isShimmed: true
  };
}
// We need the select method to be accessible outside this library
// if we want to do hydration on demand
if ((window as any).HoneyBee) {
  (window as any).HoneyBee.select = (Bee as any).prototype.select;
}
/**
 * Traverses from a child node to the nearest parent node which is marked as independent head node
 * on the server.
 * Identified with a `bee-I` attribute
 * @param node A SSR-built html element/node
 * @returns
 */
function getIndependentNode(node: any): any {
  return node.getAttribute('bee-I') ? node : getIndependentNode(node.parentNode);
}
export interface BeeElement {
  [k: symbol]: {
    node: HTMLElement | any;
    [k: string]: any;
  };
}