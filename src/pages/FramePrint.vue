<template>
  <q-page padding class="pageprint col items-start w-full">
    <photo-setup />
  </q-page>
</template>

<script lang="ts">
import PhotoSetup from 'src/components/PhotoSetup.vue';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'FramePrint',
  components: { PhotoSetup },
});
</script>

<style>
.cropper {
  height: 600px;
  width: 600px;
  background: #ddd;
}
@media print {
  .q-page {
    min-width: 0px;
    min-height: 0px !important;
  }

  .q-layout > .q-header,
  .q-layout > .q-drawer-container,
  .q-layout > .q-toolbar {
    display: none !important;
  }
  .q-layout .q-page-container,
  .q-layout .q-page-container .q-page {
    padding: 0px !important;
    padding: 0px !important;
  }
}
</style>
