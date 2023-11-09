import FieldElement from "./seed-splitter/FieldElement";
import SeedSplitter, { Point } from "./seed-splitter/SeedSplitter";
import bip39WordList from "./seed-splitter/bip39WordList";
import "./AppComponent.css";

export default class AppComponent {
  points: Point[] = [];
  node: HTMLElement;
  error: ErrorComponent;
  curve: CurveComponent;
  calculatePoint: CalculatePointComponent;

  private constructor() {
    this.node = h('div', 'container', [
      h('h2', 'title', 'Seed Splitter'),
    ]);

    this.error = ErrorComponent.create();
    this.node.append(this.error.node);

    this.node.append(RandomPointComponent.create(this).node);
    this.node.append(SpecifyPointComponent.create(this).node);

    this.curve = CurveComponent.create(this);
    this.node.append(this.curve.node);

    this.calculatePoint = CalculatePointComponent.create(this);
    this.node.append(this.calculatePoint.node);
  }

  static create() {
    return new AppComponent();
  }

  getDefaultRandomPointName() {
    for (let i = 1; ; i++) {
      const name = `RANDOM-${i}`;
      
      if (this.points.every(p => p.name !== name)) {
        return name;
      }
    }
  }

  isNameAvailable(name: string) {
    return this.points.every(p => p.name !== name);
  }

  addPoint(point: Point) {
    this.points.push(point);
    this.curve.setPoints(this.points);
    this.calculatePoint.recalculate();
  }

  removePoint(point: Point) {
    this.points = this.points.filter(p => p !== point);
    this.curve.setPoints(this.points);
    this.calculatePoint.recalculate();
  }

  setError(error: unknown) {
    this.error.setError(error);
  }
}

class ErrorComponent {
  node: HTMLElement;

  private constructor() {
    this.node = h('p', 'error');
    this.node.style.display = 'none';
  }

  static create() {
    return new ErrorComponent();
  }

  setError(error: unknown) {
    if (error === undefined) {
      this.node.textContent = '';
      this.node.style.display = 'none';
    } else {
      const msg = error instanceof Error
        ? error.message
        : `Unexpected non-error: ${error}`;

      this.node.textContent = msg;
      this.node.style.display = '';
    }
  }
}

class RandomPointComponent {
  node: HTMLElement;
  input: HTMLInputElement;
  addButton: HTMLButtonElement;

  private constructor(app: AppComponent) {
    this.node = h('div', 'section', [
      h('h2', 'sectionTitle', 'Add a Random Point'),
    ]);

    this.input = h('input', 'input');
    this.node.append(this.input);
    this.input.type = 'text';
    this.input.placeholder = 'Optional: Point Name';

    this.input.oninput = () => {
      const text = this.input.value;
      const normalized = normalizeName(text);

      if (normalized !== text) {
        this.input.value = normalized;
      }
    };

    this.addButton = h('button', 'button', 'Add');
    this.node.append(this.addButton);
    this.addButton.onclick = async () => {
      try {
        const name = this.input.value || app.getDefaultRandomPointName();

        if (!app.isNameAvailable(name)) {
          throw new Error('Point already exists');
        }

        const randomPoint: Point = {
          name,
          mnemonic: await FieldElement.random().toMnemonic(),
        };
        
        app.addPoint(randomPoint);
      } catch (error) {
        app.setError(error);
      }
    };
  }

  static create(app: AppComponent) {
    return new RandomPointComponent(app);
  }
}

class SpecifyPointComponent {
  node: HTMLElement;

  private constructor(app: AppComponent) {
    this.node = h('div', 'section', [
      h('h2', 'sectionTitle', 'Specify a Point'),
    ]);

    const pointNameInput = h('input', 'inputName');
    this.node.append(pointNameInput);
    pointNameInput.type = 'text';
    pointNameInput.placeholder = 'Point Name';
    pointNameInput.oninput = () => {
      const text = pointNameInput.value;
      const normalized = normalizeName(text);

      if (normalized !== text) {
        pointNameInput.value = normalized;
      }
    }

    const grid = h('div', 'grid');
    this.node.append(grid);

    for (let i = 1; i <= 12; i++) {
      const gridItem = h('div', 'gridItem');
      grid.append(gridItem);

      const gridNumber = h('label', 'gridNumber', `${i}.`);
      gridItem.append(gridNumber);

      const gridInput = h('input', 'input');
      gridItem.append(gridInput);
      gridInput.type = 'text';

      gridInput.oninput = () => {
        const word = gridInput.value.trim().toLowerCase();

        if (word === '') {
          gridInput.className = 'input';
        } else if (bip39WordList.includes(word)) {
          gridInput.className = 'input valid';
        } else if (bip39WordList.some(w => w.startsWith(word))) {
          gridInput.className = 'input partial';
        } else {
          gridInput.className = 'input invalid';
        }
      };
    }

    const button = h('button', 'button', 'Add');
    this.node.append(button);
    button.onclick = () => {
      try {
        const name = pointNameInput.value;

        if (!app.isNameAvailable(name)) {
          throw new Error('Point already exists');
        }

        const mnemonic = Array.from(grid.querySelectorAll('.input'))
          .map(el => ((el as HTMLInputElement).value).trim().toLowerCase())
          .filter(word => word !== '');

        if (mnemonic.length !== 12) {
          throw new Error('12 words are required');
        }

        const point: Point = {
          name,
          mnemonic,
        };

        app.addPoint(point);
      } catch (error) {
        app.setError(error);
      }
    };
  }

  static create(app: AppComponent) {
    return new SpecifyPointComponent(app);
  }
}

class CurveComponent {
  app: AppComponent;
  node: HTMLElement;
  pointsList: HTMLElement;

  private constructor(app: AppComponent) {
    this.app = app;

    this.node = h('div', 'section', [
      h('h2', 'sectionTitle', 'Curve'),
    ]);

    this.pointsList = h('ul', 'pointsList');
    this.node.append(this.pointsList);
    this.setPoints(this.app.points);
  }

  static create(app: AppComponent) {
    return new CurveComponent(app);
  }

  setPoints(points: Point[]) {
    if (points.length === 0) {
      this.pointsList.textContent = 'No points yet';
      return;
    }

    this.pointsList.innerHTML = '';

    for (const point of points) {
      const pointItem = h('li', 'pointItem');
      this.pointsList.append(pointItem);

      const pointContent = h('div', 'pointContent');
      pointItem.append(pointContent);

      const pointName = h('div', 'pointName', point.name);
      pointContent.append(pointName);

      const pointMnemonic = h('div', 'pointMnemonic', point.mnemonic.join(' '));
      pointContent.append(pointMnemonic);

      const deleteButton = h('button', 'deleteButton', '\u00D7');
      pointItem.append(deleteButton);
      deleteButton.onclick = () => {
        this.app.removePoint(point);
      };
    }
  }
}

class CalculatePointComponent {
  app: AppComponent;
  node: HTMLElement;
  input: HTMLInputElement;
  output: HTMLElement;

  private constructor(app: AppComponent) {
    this.app = app;

    this.node = h('div', 'section', [
      h('h2', 'sectionTitle', 'Calculate a Point'),
    ]);

    this.input = h('input', 'input');
    this.node.append(this.input);
    this.input.type = 'text';
    this.input.placeholder = 'Point Name';

    this.output = h('div', 'output');
    this.node.append(this.output);

    this.input.oninput = () => {
      const text = this.input.value;
      const normalized = normalizeName(text);

      if (normalized !== text) {
        this.input.value = normalized;
      }

      this.recalculate();
    }
  }

  static create(app: AppComponent) {
    return new CalculatePointComponent(app);
  }

  async recalculate() {
    try {
      if (this.input.value === '' || this.app.points.length < 2) {
        this.output.textContent = '';
      } else {
        const splitter = await SeedSplitter.fit(this.app.points);
        const mnemonic = await splitter.calculate(this.input.value);
        this.output.textContent = mnemonic.join(' ');
      }
    } catch (error) {
      this.app.setError(error);
    }
  }
}

function h<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, children?: HTMLElement | string | (HTMLElement | string)[]) {
  const el = document.createElement(tag);
  el.className = className;

  if (children !== undefined) {
    const childrenArray = Array.isArray(children)
      ? children
      : [children];

    for (const child of childrenArray) {
      el.append(child);
    }
  }

  return el;
}

function normalizeName(name: string) {
  return name.replaceAll(' ', '-').toUpperCase();
}
