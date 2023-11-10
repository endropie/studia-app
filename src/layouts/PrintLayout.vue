<template>
  <q-layout view="lHh Lpr lFf" class="bg-grey-2">
    <q-header v-if="false" elevated class="bg-primary">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="keyboard_backspace"
          aria-label="back"
          @click="$router.back()"
        />

        <q-toolbar-title> STUDIA [BETA VERSION] </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'PrintLayout',

  setup() {
    return {};
  },
});
</script>
<style>
@media print {
  .q-layout,
  .q-page {
    min-width: 0px !important;
    min-height: 0px !important;
  }

  .q-layout > .q-header,
  .q-layout > .q-drawer-container,
  .q-layout > .q-toolbar {
    display: none !important;
  }
  .q-layout .q-page-container,
  .q-layout .q-page {
    padding: 0px !important;
    margin: 0px !important;
  }
}
</style>
