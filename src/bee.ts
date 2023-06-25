class Bee {
  UI: UI;
  private isSelectiveRendering: boolean;
  private selector: any;
  private externalData: { data: { [k: string]: { data: any } } };
  private _imex: any;
  constructor() {
    this.UI = new UI();
    this.isSelectiveRendering = false;
    this.selector = null;
    let _ext = {data:{}};
    if ((window as any).HoneyBee) {
      _ext = (window as any).HoneyBee.externalData;
    }
    this.externalData = _ext;
  }
  private isSSR: boolean = (window as any).HoneyBee ? (window as any).HoneyBee.isSSR : false;
  /**
   * Used for selecting independent components that needs to be hydrated after SSR.    
   * **----Internal method----**
   */
  private select(node: any, eventName: any) {
    const independentNode = getIndependentNode(node);
    const path = independentNode.getAttribute('bee-path'),
      compName = independentNode.getAttribute('bee-N');
    B.selector = {
      node: independentNode,
      iname: independentNode.getAttribute('bee-I'),
    };
    const clientRenderdNode = B.UI.render(Namings[path + compName](/**No Initial Args */) /**No Args */);
    independentNode.replaceWith(clientRenderdNode[internal].node);
    B.isSelectiveRendering = false;
    B.selector = null;
  }
  /**
   * Creates the component UI. This is generated by the compiler by converting the JSX part of the defined components
   * @param htmlMethod A method that returns the static part of the component views
   * @param Setter 
   * @param dynamicNodes 
   * @param dependencies 
   * @param dynMethod 
   * @param comp 
   */
  create(
    htmlMethod: () => string,
    Setter: Function,
    dynamicNodes: any,
    dependencies: any,
    dynMethod: Function,
    comp: any,
  ) {
    const _internal_ = comp[internal];
    comp[internal] = null;
    const compClass = CreatedComponents.get(_internal_.fnId);
    compClass.setup(htmlMethod, Setter, dynamicNodes, dependencies, dynMethod, comp);
    if (compClass.isIndependent) {
      _internal_.independent = true;
    }
    if (B.isSelectiveRendering && _internal_.independent) {// Is hydrating
      return independent; // Independent component prevents further rendering
    }
    const node = compClass.getTemplate();
    comp = Object.create(comp);
    comp[internal] = _internal_;
    comp.initArgs = _internal_.InitArgs || comp.initArgs;
    _internal_.InitArgs = undefined;
    const id = _internal_.id;
    Blocks.set(id, comp);
    run(comp);
    const kNdN = Setter.call(comp, _internal_.Args, node, eventHandler, id, dependencies, true);
    _internal_.keyed = kNdN[0];
    _internal_.init_dyn = dynMethod(node); 
    const attrDeps = (_internal_.attrDeps = new Map());
    const state = comp.state;
    let key: string, fn:any;
    if (state) {
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
