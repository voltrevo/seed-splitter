import AppComponent from './AppComponent';
import './index.css'

const rootEl = document.getElementById('root')!;
const app = AppComponent.create();
rootEl.appendChild(app.node);
