import {
  Action,
  AttributeOptions,
  CommonObject,
  KeyframeItem,
  KeyframeOptions,
  ProcessStatus,
  RotateOptions,
  ScaleOptions,
  StyleObject,
  TaskProcessType,
} from './type';

declare const window: any;

/**
 * @class DomRender
 */
class DomRender {
  static pluginName: string = 'DomRender';
  static installed: boolean = false;
  static mot: any;

  target: HTMLElement;
  Animation: any;
  taskQueue: any[];
  originTransform: any[];
  originTransitionProperty: string[] = [];

  /**
   * Record the style every step
   */
  stylesRecordQueue: CommonObject[] = [];

  timeLine: any[];

  tempQueue: Object[];

  /**
   * current task process type
   */
  currentTaskProcessType: TaskProcessType = TaskProcessType.STOP;

  /**
   *  render status
   */
  processStatus: ProcessStatus = ProcessStatus.STOP;

  /**
   * Creates an instance of DomRender.
   * @param {HTMLElement} dom
   * @param {*} Animation
   * @memberof DomRender
   */
  constructor(dom: HTMLElement, Animation: any) {
    this.target = dom;
    let position = '';
    position = window.getComputedStyle(this.target, null).position;
    this.target.style.position =
      position == 'relative' ? 'relative' : 'absolute';
    this.Animation = Animation;
    this.init();
  }

  /**
   *
   *
   * @static
   * @param {*} mot
   * @memberof DomRender
   */
  static install(mot: any) {
    this.mot = mot;
    // register a function on the 'mot'
    mot.register('dom', (dom: HTMLElement, Animation: any) => {
      return new DomRender(dom, Animation);
    });
  }

  /**
   *
   *
   * @memberof DomRender
   */
  init() {
    this.originTransform = this.getOriginStyleTransform(this.target);
    const animations = this.Animation.actions;
    this.taskQueue = animations.children || [];
    this.initStyle(this.taskQueue);
  }

  /**
   * update this style
   * @param {(string | null)} transform
   * @param {(string | null)} transitionProperty
   * @memberof DomRender
   */
  update(transform: string | null, transitionProperty: string | null) {
    if (transform !== null) {
      this.originTransform = this.splitStyleToArray(transform);
    }
    if (transitionProperty !== null) {
      this.originTransitionProperty =
        this.splitTransitionPropertyToArray(transitionProperty);
    }
  }

  /**
   *
   *
   * @param {HTMLElement} element
   * @return {*}
   * @memberof DomRender
   */
  getOriginStyleTransform(element: HTMLElement) {
    let transform: string = element.style.transform;
    transform =
      transform === ''
        ? window.getComputedStyle(element, null).transform
        : transform;
    if (transform === '' || transform === null || transform === 'none') {
      return [];
    }
    return this.splitStyleToArray(transform);
  }

  /**
   *
   *
   * @param {Action[]} taskQueue
   * @memberof DomRender
   */
  initStyle(taskQueue: Action[]) {
    let ifInitMove = false;
    const moveInit = () => {
      this.target.style.left =
        window.getComputedStyle(this.target, null).left || '0px';
      this.target.style.top =
        window.getComputedStyle(this.target, null).top || '0px';
    };
    for (let i = 0, l = taskQueue.length; i < l; i++) {
      const item = taskQueue[i];
      if (item.type === 'group') {
        const ifHasMoveAction =
          item.children.findIndex((item) => item.action === 'move') !== -1;
        !ifInitMove && ifHasMoveAction && moveInit();
        ifInitMove = true;
      } else {
        if (item.action === 'move') {
          !ifInitMove && moveInit();
          ifInitMove = true;
        }
      }
    }
  }

  render() {
    const waitingList: StyleObject[] = this.getStyleFromTaskQueue(
      this.taskQueue,
    );
    const len: number = waitingList.length;
    let index: number = 0;
    const next = (item: StyleObject, time: number = -1) => {
      const done = () => {
        this.processStatus = ProcessStatus.PLAYING;
        const {style} = item;
        this.currentTaskProcessType = TaskProcessType[item.type.toUpperCase()];
        // eslint-disable-next-line guard-for-in
        for (const attr in style) {
          this.target.style[attr] = style[attr];
        }
        index++;
        if (index < len) {
          next(
            waitingList[index],
            index === 0 ? 0 : waitingList[index - 1].duration,
          );
        }
      };
      // 判断是同步还是异步执行
      // -1 代表同步
      // -2 代表走requestAnimationFrame
      if (time === -1) {
        done();
      } else if (time === -2) {
        requestAnimationFrame(() => {
          done();
        });
      } else {
        setTimeout(() => {
          done();
        }, time);
      }
    };
    setTimeout(() => {
      next(waitingList[0]);
    }, 0);
    return this;
  }

  /**
   *
   *
   * @param {any[]} origin
   * @param {string} newStyle
   * @return {*}  {string}
   * @memberof DomRender
   */
  mergeTransForm(origin: any[], newStyle: string): string {
    const newStyleArray = this.splitStyleToArray(newStyle);
    let transformStyle = newStyle;
    origin.forEach((item: any) => {
      let ifHasSameTransform = false;
      for (let i = 0, l = newStyleArray.length; i < l; i++) {
        if (item[0][0] == newStyleArray[i][0][0]) {
          ifHasSameTransform = true;
          break;
        }
      }
      if (!ifHasSameTransform) {
        transformStyle = transformStyle + ` ${item[0]}(${item[1]})`;
      }
    });
    return transformStyle;
  }

  /**
   *
   *
   * @param {string[]} origin
   * @param {string} newProperty
   * @return {*}
   * @memberof DomRender
   */
  mergeTransitionProperty(origin: string[], newProperty: string) {
    const newPropertyArray: string[] =
      this.splitTransitionPropertyToArray(newProperty);
    let transitionProperty = newProperty;
    origin.forEach((item: any) => {
      if (!newPropertyArray.includes(item)) {
        transitionProperty = transitionProperty + ',' + item;
      }
    });
    return transitionProperty;
  }

  /**
   *
   *
   * @param {any[]} taskQueue
   * @return {*}  {StyleObject[]}
   * @memberof DomRender
   */
  getStyleFromTaskQueue(taskQueue: any[]): StyleObject[] {
    const styleArray: StyleObject[] = [];
    taskQueue.forEach((item) => {
      if (item.type == 'group') {
        item.children.forEach((child) => {
          child.duration = item.duration;
          styleArray.push({
            style: this.transferAction(child),
            duration: -1,
            type: item.action,
          });
        });
        styleArray.push({
          style: {},
          duration: item.duration,
          type: item.action,
        });
      } else if (item.action == 'wait') {
        styleArray.push({style: {}, duration: item.time, type: item.action});
      } else if (item.action == 'statusOn' || item.action == 'statusOff') {
        styleArray.push({
          style: {},
          duration: item.duration,
          status: item.action,
          type: item.action,
        });
      } else if (item.action === 'path') {
        item.points.forEach((point) => {
          styleArray.push({
            style: {left: `${point.x}px`, top: `${point.y}px`},
            duration: -2,
            type: item.action,
          });
        });
      } else {
        styleArray.push({
          style: this.transferAction(item),
          duration: item.duration,
          type: item.action,
        });
      }
    });
    return styleArray;
  }

  /**
   *
   *
   * @param {Action} item
   * @return {*}
   * @memberof DomRender
   */
  transferAction(item: Action) {
    const TYPE_MAP = {
      translate: this.translate,
      rotate: this.rotate,
      scale: this.scale,
      attribute: this.attribute,
      move: this.move,
      keyframe: this.keyframe,
    };
    return TYPE_MAP[item.action].bind(this)(item);
  }

  /**
   *
   *
   * @param {*} params
   * @return {*}
   * @memberof DomRender
   */
  translate(params: any) {
    let transform =
      params.z !== undefined
        ? `translate3d(${params.x},${params.y})`
        : `translate(${params.x},${params.y},${params.z})`;
    const transitionDuration = `${params.duration}ms`;
    const transitionTimingFunction = `${params.timeFunction}`;
    let transitionProperty = `transform`;
    transform = this.mergeTransForm(this.originTransform, transform);
    transitionProperty = this.mergeTransitionProperty(
      this.originTransitionProperty,
      transitionProperty,
    );
    this.update(transform, transitionProperty);
    return {
      transform,
      transitionDuration,
      transitionTimingFunction,
      transitionProperty,
    };
  }

  /**
   *
   *
   * @param {*} params
   * @return {*}
   * @memberof DomRender
   */
  move(params: any) {
    const left = `${Number(params.x) ? params.x + 'px' : params.x}`;
    const top = `${Number(params.y) ? params.y + 'px' : params.y}`;
    const transitionDuration = `${params.duration}ms`;
    const transitionTimingFunction = `${params.timeFunction}`;
    let transitionProperty = `left,top`;
    transitionProperty = this.mergeTransitionProperty(
      this.originTransitionProperty,
      transitionProperty,
    );
    this.update(null, transitionProperty);
    return {
      left,
      top,
      transitionDuration,
      transitionTimingFunction,
      transitionProperty,
    };
  }

  /**
   *
   *
   * @param {ScaleOptions} params
   * @return {*}
   * @memberof DomRender
   */
  scale(params: ScaleOptions) {
    let transform =
      params.z !== undefined
        ? `scale3d(${params.x},${params.y},${params.z})`
        : `scale(${params.x},${params.y})`;
    const transitionDuration = `${params.duration}ms`;
    const transitionTimingFunction = `${params.timeFunction}`;
    const transformOrigin = `${params.transformOrigin}`;
    let transitionProperty = `transform`;
    transform = this.mergeTransForm(this.originTransform, transform);
    transitionProperty = this.mergeTransitionProperty(
      this.originTransitionProperty,
      transitionProperty,
    );
    this.update(transform, transitionProperty);
    return {
      transform,
      transitionDuration,
      transitionTimingFunction,
      transitionProperty,
      transformOrigin,
    };
  }

  /**
   *
   *
   * @param {RotateOptions} params
   * @return {*}
   * @memberof DomRender
   */
  rotate(params: RotateOptions) {
    let transform =
      params.x !== undefined || params.y !== undefined
        ? `rotate3d(${params.x}deg,${params.y}deg,${params.z}deg)`
        : `rotate(${params.z}deg)`;
    const transitionDuration = `${params.duration}ms`;
    const transitionTimingFunction = `${params.timeFunction}`;
    const transformOrigin = `${params.transformOrigin}`;
    let transitionProperty = `transform`;
    transform = this.mergeTransForm(this.originTransform, transform);
    transitionProperty = this.mergeTransitionProperty(
      this.originTransitionProperty,
      transitionProperty,
    );
    this.update(transform, transitionProperty);
    return {
      transform,
      transformOrigin,
      transitionDuration,
      transitionTimingFunction,
      transitionProperty,
    };
  }

  /**
   *
   *
   * @param {AttributeOptions} params
   * @return {*}
   * @memberof DomRender
   */
  attribute(params: AttributeOptions) {
    const transitionDuration = `${params.duration}ms`;
    const transitionTimingFunction = `${params.timeFunction}`;
    let transitionProperty = `${this.humpParse(params.key)}`;
    transitionProperty = this.mergeTransitionProperty(
      this.originTransitionProperty,
      transitionProperty,
    );
    this.update(null, transitionProperty);
    return {
      [params.key]: params.value,
      transitionDuration,
      transitionTimingFunction,
      transitionProperty,
    };
  }

  keyframe(params: KeyframeOptions) {
    let keyframeString = '';
    params.keyframe.forEach((item: KeyframeItem) => {
      let temp = '';
      let actions = '';
      for (const key in item.action) {
        actions += `${this.humpParse(key)}:${item.action[key]};`;
      }
      temp = `${item.process} {${actions}}`;
      keyframeString += temp;
    });
    this.insertKeyFrame(`@keyframes obiusm-${params.uid} {${keyframeString}}`);
    const className = `obiusm-class-${params.uid}`;
    this.addStylesheetRules([
      [
        '.' + className,
        [
          'animation',
          `obiusm-${params.uid}${' '} 
        ${params.duration + 'ms' || '0.4s'}${' '}
        ${params.timeFunction || 'ease'}${' '}
        ${params.delay || '0s'}${' '}
        ${params.iterationCount === undefined ? 1 : params.iterationCount}${' '}
        ${params.direction === undefined ? 'normal' : params.direction}${' '}
        ${params.fillMode === undefined ? 'none' : params.fillMode}${' '}
        `,
        ],
      ],
    ]);
    this.addClassName(this.target, className);
  }

  /**
   *
   * aaaBbb=>‘aaa-bbb’
   * @param {string} s
   * @return {*}
   * @memberof DomRender
   */
  humpParse(s: string) {
    const reg = /([a-z]+)|([A-Z]{1}[a-z]+)/g;
    const r = s.match(reg);
    let attr = '';
    r.forEach((e, index) => {
      if (index === 0) {
        attr = e;
      } else {
        e = e.toLowerCase();
        attr = attr + '-' + e;
      }
    });
    return attr;
  }

  /**
   *
   * "rotate(10) translate(1,1)" -> [["rotate",10],[translate,"1,1"]]
   * @param {string} styleString
   * @return {*}  {any[]}
   * @memberof DomRender
   */
  splitStyleToArray(styleString: string): any[] {
    const transformArray = styleString.match(/[a-zA-Z]+\s*?\(.*?\)/gms);
    return transformArray.map((item: string) => {
      try {
        const KEY_REG = /([a-zA-Z]*?)\(/;
        const VALUE_REG = /\((.*)\)/;
        // match the origin attributes
        return [[item.match(KEY_REG)[1]], item.match(VALUE_REG)[1]];
      } catch (error) {
        throw new Error('There is something wrong with transform style');
      }
    });
  }

  /**
   *
   *
   * @param {string} property
   * @return {*}  {string[]}
   * @memberof DomRender
   */
  splitTransitionPropertyToArray(property: string): string[] {
    const array = property
      .split(',')
      .filter((item) => item !== '' || item !== undefined);
    return array;
  }

  /**
   * @example
   addStylesheetRules([
   ['h2', // 还接受第二个参数作为数组中的数组
   ['color', 'red'],
   ['background-color', 'green', true] // 'true' for !important rules
   ],
   ['.myClass',
   ['background-color', 'yellow']
   ]
   ]);
   * @param {*} decls
   * @memberof DomRender
   */
  addStylesheetRules(decls) {
    const style = document.createElement('style');
    document.getElementsByTagName('head')[0].appendChild(style);
    if (!window.createPopup) {
      /* For Safari */
      style.appendChild(document.createTextNode(''));
    }
    const s = document.styleSheets[document.styleSheets.length - 1];
    for (let i = 0, dl = decls.length; i < dl; i++) {
      let j = 1;
      let decl = decls[i];
      const selector = decl[0];
      let rulesStr = '';
      if (Object.prototype.toString.call(decl[1][0]) === '[object Array]') {
        decl = decl[1];
        j = 0;
      }
      for (let rl = decl.length; j < rl; j++) {
        const rule = decl[j];
        rulesStr +=
          rule[0] + ':' + rule[1] + (rule[2] ? ' !important' : '') + ';\n';
      }

      if (s.insertRule) {
        s.insertRule(selector + '{' + rulesStr + '}', s.cssRules.length);
      } else {
        /* IE */
        s.addRule(selector, rulesStr, -1);
      }
    }
  }

  /**
   * insert keyframe
   * @param {string} keyframe
   */
  insertKeyFrame(keyframe: string) {
    try {
      const style = document.createElement('style');
      style.innerHTML = keyframe;
      document.getElementsByTagName('head')[0].appendChild(style);
    } catch (err) {
      console.error(`insertKeyFrame error`, err);
    }
  }

  /**
   * add className
   *
   * @param {HTMLElement} dom -html element
   * @param {string} className
   * @memberof DomRender
   */
  addClassName(dom: HTMLElement, className: string) {
    let c = dom.className;
    c = `${c} ${className}`;
    dom.className = c;
  }

  /**
   * removeClassName
   *
   * @param {HTMLElement} dom
   * @param {string} className
   * @memberof DomRender
   */
  removeClassName(dom: HTMLElement, className: string) {
    let c = dom.className;
    c = c.replace(className, '');
    dom.className = c;
  }

  pause() {}

  play() {}
}

export default DomRender;
