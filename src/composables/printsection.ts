import { toRefs, reactive, watch, computed } from 'vue';
import { LocalStorage } from 'quasar';
import { FrameInterface, PrintSection } from 'src/types/photoprint';
import { useRoute, useRouter } from 'vue-router';
import moment from 'moment';

const PREFIX_SECTION = 'std__section--',
  TIMEOUT_MINUTE = 2;

function getLocalSections() {
  return LocalStorage.getAllKeys().reduce((rs, key) => {
    if (String(key).startsWith(PREFIX_SECTION)) {
      const nk = String(key).replace(PREFIX_SECTION, '');
      rs[nk] = LocalStorage.getItem(key) as PrintSection['data'];
    }
    return rs;
  }, {} as Record<string, PrintSection['data']>);
}

const state = reactive({
  rooms: [{ code: 'A1' }, { code: 'A2' }],
  sections: getLocalSections(),
  now: moment().format(),
});

watch(state.sections, (v) => {
  Object.keys(v).forEach((e) => {
    LocalStorage.set(PREFIX_SECTION + e, v[e]);
  });
});

export const usePrintSection = () => {
  const $route = useRoute();
  const $router = useRouter();

  setInterval(() => (state.now = moment().format()), 1000);

  const SECTION = computed(() => {
    return state.sections[String($route.query.section)] || null;
  });
  const SECTION_INDEXED = computed(() => {
    if (!SECTION.value) return undefined;

    return SECTION.value.frames.length < SECTION.value.limit
      ? 1 + SECTION.value.frames.length
      : SECTION.value.limit;
  });
  const PRINT_ALLOWED = computed(() => {
    return SECTION.value.frames?.length < SECTION.value.limit;
  });
  const NEXT_PRINT_ALLOWED = computed(() => {
    return Number(SECTION.value.frames?.length) + 1 < SECTION.value.limit;
  });

  return {
    SECTION,
    SECTION_INDEXED,
    PRINT_ALLOWED,
    NEXT_PRINT_ALLOWED,
    ...toRefs(state),
    SetPrintSection: (frame: FrameInterface) => {
      state.sections[String($route.query.section)].frames.push(frame);
    },
    setAdditinalTime: () => {
      state.sections[String($route.query.section)].timeout_at = moment()
        .add(1, 'minute')
        .format();
    },
    setDone: () => {
      if (SECTION.value) {
        LocalStorage.remove(PREFIX_SECTION + SECTION.value.room);
        delete state.sections[SECTION.value.room];
      }
      $router.push('/');
    },
  };
};

export const newCreateForceSection = (param: PrintSection['data']) => {
  const { room, limit } = param;
  state.sections[room] = {
    room,
    limit,
    frames: [],
    timeout_at: moment().add(TIMEOUT_MINUTE, 'minute').format(),
  } as PrintSection['data'];
};

export const newCreateSection = (param: PrintSection['record']) => {
  const { room, limit } = param;

  return new Promise<PrintSection['data']>((resolve, reject) => {
    if (!room) reject();
    else if (state.sections[room]) return reject(state.sections[room]);
    else {
      state.sections[room] = {
        room,
        limit,
        frames: [],
        timeout_at: moment().add(TIMEOUT_MINUTE, 'minute').format(),
      } as PrintSection['data'];
      resolve(state.sections[room]);
    }
  });
};
