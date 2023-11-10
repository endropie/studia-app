import { boot } from 'quasar/wrappers';
import { setCssVar } from 'quasar';
import basemoment from 'moment';

const moment = basemoment;

export default boot(() => {
  setCssVar('primary', '#e27f1a');
  setCssVar('secondary', '#8d4800');
});

export { moment };
