<template>
  <q-card>
    <q-card-section>
      <div class="flex flex-row justify-center gap-2">
        <q-card class="relative flex-none w-96">
          <q-bar dark class="bg-primary text-white">
            <div class="col text-left text-weight-bold">STUDIO PRINT</div>
            <q-space />
            <q-badge
              v-if="SECTION?.limit"
              color="white"
              text-color="primary"
              class="text-bold"
              :label="`${SECTION_INDEXED}/${SECTION?.limit}`"
            />
          </q-bar>
          <q-stepper
            header-nav
            animated
            vertical
            v-model="step"
            ref="stepper"
            done-color="primary"
            active-color="primary"
            inactive-color="blue-grey"
          >
            <q-step
              :name="1"
              title="Select frame"
              icon="settings"
              :done="step > 1"
            >
              <div class="flex flex-row gap-4">
                <q-uploader
                  class="flex-col"
                  color="primary"
                  flat
                  bordered
                  style="max-width: 400px"
                  @added="setFrameFn"
                >
                  <template v-slot:header="scope">
                    <div class="row no-wrap items-center q-pa-sm q-gutter-xs">
                      <q-icon name="photo" size="18pt" />
                      <div class="col">
                        <div class="q-uploader__title">Select Photo Frame</div>
                        <div class="q-uploader__subtitle"></div>
                      </div>
                      <q-btn
                        v-if="!frame.image.src"
                        type="a"
                        icon="add_box"
                        @click="scope.pickFiles"
                        round
                        dense
                        flat
                      >
                        <q-uploader-add-trigger />
                        <q-tooltip>Pick Files</q-tooltip>
                      </q-btn>
                      <q-btn
                        v-else
                        flat
                        dense
                        outlined
                        icon="delete"
                        @click="
                          () => {
                            scope.removeQueuedFiles();
                            onRemoveFrameImage();
                          }
                        "
                      />
                    </div>
                  </template>
                  <template v-slot:list="scope">
                    <img
                      v-if="frame.image.src && scope.files.length === 0"
                      :src="frame.image.src"
                    />
                    <div v-for="file in scope.files" :key="file.__key">
                      <img :src="file.__img.src" />
                    </div>
                  </template>
                </q-uploader>

                <div class="flex-none flex flex-col gap-4">
                  <div class="flex flex-nowrap">
                    <label class="pt-2 pr-2">Photo size</label>
                    <q-select
                      dense
                      outlined
                      class="mini"
                      v-model="frame.size"
                      :options="sizeOptions"
                      map-options
                      emit-value
                      @update:model-value="setFrameSize"
                    />
                  </div>
                  <div>
                    <label>For grid, please select number of photos.</label>
                    <div class="grid grid-cols-4 gap-2">
                      <q-radio
                        v-for="opt in gridOptions"
                        :key="opt.value"
                        :model-value="frame.photos.length || 1"
                        @update:model-value="setPhotoLimit"
                        :val="opt.value"
                        :label="opt.label"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </q-step>

            <q-step
              :name="2"
              title="Select Photo"
              icon="create_new_folder"
              :done="step > 2"
            >
              <div class="flex flex-row gap-4">
                <q-uploader
                  bordered
                  class="flex-col"
                  color="primary"
                  flat
                  multiple
                  accept=".jpg, image/*"
                  @added="setPhotoFn"
                  :style="{
                    width: '700px',
                    maxHeight: '400px',
                  }"
                >
                  <template v-slot:header="scope">
                    <div class="row no-wrap items-center q-pa-sm q-gutter-xs">
                      <q-icon name="photo" size="18pt" />
                      <div class="col">
                        <div class="q-uploader__title">Pick photos</div>
                        <div class="q-uploader__subtitle"></div>
                      </div>
                      <q-btn
                        v-if="HAS_PHOTO_UNLOADED"
                        type="a"
                        icon="add_box"
                        @click="scope.pickFiles"
                        round
                        dense
                        flat
                      >
                        <q-uploader-add-trigger />
                        <q-tooltip>Pick Files</q-tooltip>
                      </q-btn>
                    </div>
                  </template>
                  <template v-slot:list>
                    <div class="flex flex-row">
                      <q-list
                        class="flex-none w-24"
                        separator
                        style="border-right-width: 1px"
                      >
                        <q-item
                          clickable
                          v-ripple
                          v-for="(photo, pIndex) in frame.photos"
                          :key="pIndex"
                          active-class="bg-secondary"
                          :active="Boolean(photoSelected === pIndex)"
                          @click="setPhotoSelected(pIndex)"
                        >
                          <q-item-section avatar>
                            <q-img
                              fit="cover"
                              :src="photo.src || undefined"
                              placeholder-src="images/blank.jpg"
                              height="66px"
                              width="66px"
                              spinner-color="primary"
                              spinner-size="62px"
                            />
                          </q-item-section>
                        </q-item>
                      </q-list>
                      <q-card flat class="flex-grow">
                        <q-card-section v-if="frame.photos[photoSelected]">
                          <div class="flex flex-col justify-evenly gap-2">
                            <!-- SIZE -->
                            <div class="flex flex-1 flex-col gap-2">
                              <q-checkbox
                                dense
                                :model-value="
                                  Boolean(frame.photos[photoSelected].ratio)
                                "
                                @update:model-value="
                                  setPhotoRatio(photoSelected)
                                "
                                label="Lock Ratio"
                                color="primary"
                              />
                              <div class="flex flex-nowrap gap-2 w-40">
                                <label class="flex-grow py-1">WIDTH</label>
                                <q-input
                                  class="mini"
                                  style="width: 50pt"
                                  outlined
                                  dense
                                  v-model="frame.photos[photoSelected].width"
                                  @update:model-value="
                                    setHeightByRatio(photoSelected)
                                  "
                                  type="number"
                                />
                              </div>
                              <div class="flex flex-nowrap gap-2 w-40">
                                <label class="flex-grow py-1">HEIGHT</label>
                                <q-input
                                  class="mini"
                                  style="width: 50pt"
                                  outlined
                                  dense
                                  v-model="frame.photos[photoSelected].height"
                                  @update:model-value="
                                    setWidthByRatio(photoSelected)
                                  "
                                  type="number"
                                />
                              </div>
                            </div>
                            <q-separator spaced />

                            <!-- AXIS POSITION -->
                            <div class="flex flex-1 flex-col gap-2">
                              <div class="flex flex-nowrap gap-2 w-40">
                                <label class="flex-grow py-1">X - AXIS</label>
                                <q-input
                                  class="mini"
                                  style="width: 50pt"
                                  outlined
                                  dense
                                  v-model="frame.photos[photoSelected].left"
                                  type="number"
                                />
                              </div>
                              <div class="flex flex-nowrap gap-2 w-40">
                                <label class="flex-grow py-1">Y - AXIS</label>
                                <q-input
                                  class="mini"
                                  style="width: 50pt"
                                  outlined
                                  dense
                                  v-model="frame.photos[photoSelected].top"
                                  type="number"
                                />
                              </div>
                            </div>
                          </div>
                        </q-card-section>
                        <q-separator />
                        <q-card-actions v-if="frame.photos[photoSelected]?.src">
                          <q-btn
                            color="negative"
                            label="Remove"
                            @click="removePhoto(photoSelected)"
                            :tabindex="-1"
                          />
                          <q-space />
                          <q-btn
                            v-if="frame.photos.length > 1 && HAS_PHOTO_LOADED"
                            color="negative"
                            label="Clear All"
                            @click="removePhotos()"
                            outline
                            :tabindex="-1"
                          />
                        </q-card-actions>
                      </q-card>
                    </div>
                  </template>
                </q-uploader>
              </div>
            </q-step>

            <q-step :name="3" title="Print Photo" icon="add_comment">
              <q-btn @click="setPrint()" color="primary" label="Print now" />
            </q-step>

            <template v-slot:navigation>
              <q-stepper-navigation>
                <q-btn
                  v-if="step < 3"
                  @click="stepper?.next()"
                  color="primary"
                  :label="step === 3 ? 'Finish' : 'Continue'"
                />
                <q-btn
                  v-if="step > 1"
                  flat
                  color="primary"
                  @click="stepper?.previous()"
                  label="Back"
                  class="q-ml-sm"
                />
              </q-stepper-navigation>
            </template>
          </q-stepper>
        </q-card>
        <div class="flex-grow flex flex-row justify-center p-4 bg-gray-200">
          <photo-frame
            style="margin: 5rem auto"
            :disable="false"
            :photoSelected="photoSelected"
            v-model="frame"
            @resize="
              (i, v) => {
                frame.photos[i].top = Number(v.top);
                frame.photos[i].left = Number(v.left);
                frame.photos[i].width = Number(v.width);
                frame.photos[i].height = Number(v.height);
              }
            "
            @rotate="
              (i, v) => {
                frame.photos[i].deg = Number(v);
              }
            "
          />
        </div>
      </div>
    </q-card-section>
  </q-card>

  <div v-if="SECTION && TIME_ELAPSED" class="absolute-center top-10">
    <q-card>
      <q-card-section class="p-2">
        <countdown
          @timeElapsed="onTimeElapsed"
          :deadlineISO="SECTION.timeout_at"
          countdown-size="1.2rem"
          label-size="0.5rem"
          :show-label="false"
          :show-days="false"
          :show-hours="false"
          :flip-animation="true"
          main-color="white"
          main-flip-background-color="#b17200"
          second-flip-background-color="#b17200"
        />
      </q-card-section>
    </q-card>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue';
import { Dialog, QStepper } from 'quasar';
import { moment } from 'src/boot/setup';
import PhotoFrame from 'src/components/PhotoFrame.vue';
import { MRecord, FrameInterface, PhotoInterface } from 'src/types/photoprint';
import { convert, elementToPrint } from 'src/boot/photoprint';
import { usePrintSection } from 'src/composables/printsection';
import { Countdown } from 'vue3-flip-countdown';

const newPhoto = (params?: MRecord<PhotoInterface>): PhotoInterface => {
  const v = JSON.parse(
    JSON.stringify({
      src: null,
      deg: 0,
      left: 2,
      top: 2,
      width: convert.mm2px(98),
      height: convert.mm2px(146),
      zindex: 0,
      mode: 'design',
      flag: false,
      gridX: 10,
      gridY: 50,
      ...params,
    })
  );
  v.ratio = Number(v.width) / Number(v.height);
  return v;
};
const newFrame = () =>
  JSON.parse(
    JSON.stringify({
      size: '4R',
      image: {
        src: null,
        deg: 0,
        top: 0,
        left: 0,
        fit: true,
      },
      photos: [newPhoto()],
    })
  );

export default defineComponent({
  name: 'PhotoSetup',
  components: { PhotoFrame, Countdown },
  setup() {
    const gridOptions = ref([
      { value: 1, label: 'none' },
      { value: 2, label: '2' },
      { value: 3, label: '3' },
      { value: 4, label: '4' },
    ]);
    const sizeOptions = ref([{ value: '4R', label: '4R [102mm x 152mm]' }]);

    const photoSelected = ref<number>(-1);
    const stepper = ref(QStepper);

    const {
      now,
      SECTION,
      SECTION_INDEXED,
      PRINT_ALLOWED,
      NEXT_PRINT_ALLOWED,
      SetPrintSection,
      setAdditinalTime,
      setDone,
    } = usePrintSection();

    const frame = ref<FrameInterface>(newFrame());

    const resetFrame = () => (frame.value = newFrame());

    const onTimeElapsed = () => {
      Dialog.create({
        title: 'Warning',
        message: 'Your print creation time is up. Do you need additional time?',
        ok: 'OK',
        cancel: 'CLOSE',
      })
        .onOk(() => setAdditinalTime())
        .onCancel(() => setDone());
    };

    const onNoLimit = () => {
      Dialog.create({
        persistent: true,
        title: 'Warning',
        message: 'You has not limit to print',
        ok: 'OK',
      }).onOk(() => {
        setDone();
      });
    };

    onMounted(() => {
      if (!PRINT_ALLOWED) onNoLimit();
      else if (moment(SECTION.value.timeout_at).isBefore()) {
        onTimeElapsed();
      }
    });

    return {
      step: ref(1),
      frame,
      gridOptions,
      sizeOptions,
      photoSelected,
      stepper,
      SECTION,
      SECTION_INDEXED,
      TIME_ELAPSED: computed(() => SECTION.value.timeout_at >= now.value),
      now,
      setPhotoLimit: (v: number) => {
        if (Number(v) <= 1) {
          frame.value.photos = [newPhoto()];
        } else {
          frame.value.photos = [];
          for (let index = 0; index < v; index++) {
            frame.value.photos.push(
              newPhoto({
                top: 0 + index * 10,
                left: 0 + index * 10,
                width: Math.round(convert.mm2px(80)),
                height: Math.round(convert.mm2px(120)),
              })
            );
          }
        }
      },
      setPhotoFn: (files: readonly File[]) => {
        const setPhotoSize = (index: number, file: File) => {
          const img = new Image();
          img.src = window.URL.createObjectURL(file);
          img.onload = () => {
            setTimeout(() => {
              if (frame.value.photos[index] && img.height && img.width) {
                frame.value.photos[index].ratio = img.width / img.height;

                frame.value.photos[index].height = Math.floor(
                  Number(frame.value.photos[index].width) /
                    Number(frame.value.photos[index].ratio)
                );
              }
            }, 100);
          };
        };
        return new Promise((resolve) => {
          files.forEach((file) => {
            const index = frame.value.photos.findIndex((e) => !e.src);
            if (index >= 0) {
              frame.value.photos[index].src = URL.createObjectURL(file);
              setPhotoSize(index, file);
            }
          });

          resolve({} as unknown);
        });
      },
      setFrameFn: (files: readonly File[]) => {
        return new Promise((resolve) => {
          frame.value.image.src = URL.createObjectURL(files[0]);
          setTimeout(() => {
            resolve({} as unknown);
          }, 2000);
        });
      },
      onRemoveFrameImage: () => {
        frame.value.image = {
          src: null,
          deg: 0,
          top: 0,
          left: 0,
          fit: true,
        };
      },
      setFrameSize: (v: string) => {
        frame.value.size = v;
        photoSelected.value = -1;
      },
      setPhotoRatio: (index: number) => {
        frame.value.photos[index].ratio = Boolean(
          frame.value.photos[index].ratio
        )
          ? null
          : frame.value.photos[index].width / frame.value.photos[index].height;
      },
      setWidthByRatio: (index: number) => {
        if (frame.value.photos[index]?.ratio) {
          frame.value.photos[index].width =
            frame.value.photos[index].height *
            Number(frame.value.photos[index].ratio);
        }
      },
      setHeightByRatio: (index: number) => {
        if (frame.value.photos[index]?.ratio) {
          frame.value.photos[index].height =
            frame.value.photos[index].width /
            Number(frame.value.photos[index].ratio);
        }
      },
      setPhotoSelected: (index: number) => {
        photoSelected.value = photoSelected.value === index ? -1 : index;
      },
      setPrint: () => {
        if (PRINT_ALLOWED.value) {
          elementToPrint('photoprint');
          Dialog.create({
            persistent: true,
            title: 'Confirmation',
            message: 'The photo has been printed.',
            ok: {
              flat: false,
              label: NEXT_PRINT_ALLOWED.value ? 'Next' : 'Done',
            },
            cancel: true,
          }).onOk(() => {
            SetPrintSection(frame.value);
            if (PRINT_ALLOWED.value) resetFrame();
            else setDone();
          });
        } else onNoLimit();
      },
      removePhoto: (index: number) => {
        if (frame.value.photos[index]?.src) {
          frame.value.photos[index].src = null;
        }
      },
      removePhotos: () => {
        frame.value.photos.forEach((e) => (e.src = null));
      },
      onTimeElapsed,
      HAS_PHOTO_UNLOADED: computed(() => {
        return frame.value.photos.some((e) => !e.src);
      }),
      HAS_PHOTO_LOADED: computed(() => {
        return frame.value.photos.some((e) => e.src);
      }),
    };
  },
});
</script>

<style>
.q-uploader__list {
  padding: 0;
}
.q-input.q-field--dense.mini .q-field__control {
  height: 30px;
}

.flip-card.flip-clock__card {
  padding-bottom: 0.62em;
}
.flip-card .flip-card__bottom,
.flip-card .flip-card__back-bottom,
.flip-card .flip-card__bottom:after,
.flip-card .flip-card__back-bottom:after {
  border-top: solid 1px #ffffff70;
}
</style>
