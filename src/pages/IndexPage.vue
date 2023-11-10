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
      class="w-full h-full flex flex-col items-center justify-center"
      style="background-color: #ffffff99"
    >
      <q-card-section class="flex flex-col items-center justify-center gap-4">
        <q-btn
          class="w-72"
          size="lg"
          color="primary"
          icon="camera"
          label="Create Now"
          @click="newFrameDialog = true"
        />
      </q-card-section>
    </q-card>
    <q-dialog v-model="newFrameDialog" persistent>
      <q-card class="w-72 bg-primary text-white font-semibold">
        <q-card-section>
          <div class="text-xl text-semibold text-center">@REWINDSTUDIO.ID</div>
        </q-card-section>
        <q-separator inset />
        <q-card-section class="grid grid-cols-3 gap-3">
          <label for="" class="col-span-2 pt-1.5">NO. ROOM</label>
          <q-input
            bg-color="white"
            color="white"
            disable
            dense
            outlined
            v-model="print.room"
            input-class="text-primary text-bold text-right"
          />
          <label for="" class="col-span-2 pt-2">PRINT LIMIT</label>
          <q-input
            bg-color="white"
            color="white"
            dense
            flat
            outlined
            v-model="print.limit"
            type="number"
            input-class="text-primary text-bold text-right"
          />
        </q-card-section>
        <q-card-section>
          <q-btn
            class="w-full"
            color="secondary"
            label="OK"
            @click="onCreateSection"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { PrintSection } from 'src/types/photoprint';
import {
  newCreateSection,
  newCreateForceSection,
} from 'src/composables/printsection';
import { useRouter } from 'vue-router';
import { Dialog } from 'quasar';

export default defineComponent({
  name: 'IndexPage',
  setup() {
    const newFrameDialog = ref(false);
    const print = ref<PrintSection['record']>({
      room: 'A1',
      limit: 2,
    });

    const $router = useRouter();

    return {
      newFrameDialog,
      print,
      onCreateSection: () => {
        const redirect = (section: string) => {
          $router.push(`/photoframe?section=${section}`);
        };

        newCreateSection(print.value)
          .then((v) => {
            redirect(v.room);
          })
          .catch((v: PrintSection['data'] | undefined) => {
            if (v) {
              Dialog.create({
                title: 'CONFIRMATION',
                message: 'Section has ready, are you continue!',
                ok: {
                  label: 'Continue',
                  flat: false,
                  color: 'primary',
                },
                cancel: {
                  flat: true,
                  label: 'Reset',
                  color: 'secondary',
                },
              })
                .onOk(() => {
                  redirect(print.value.room as string);
                })
                .onCancel(() => {
                  newCreateForceSection(print.value as PrintSection['data']);
                  redirect(print.value.room as string);
                });
            }
          });
      },
    };
  },
});
</script>
