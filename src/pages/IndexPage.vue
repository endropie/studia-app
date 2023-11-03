<template>
  <q-page
    padding
    class="flex flex-col items-center justify-stretch"
    style="
      background-image: url('images/studiocard.jpeg');
      height: calc(100vh - 100px);
    "
  >
    <q-card
      flat
      class="w-full h-full flex flex-row items-center justify-center"
      style="background-color: #ffffff99"
    >
      <q-card-section class="flex flex-row items-center justify-center">
        <q-btn
          size="lg"
          color="blue-grey"
          icon="camera"
          label="Frame Photo"
          to="/photoframe"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'IndexPage',
});
</script>
