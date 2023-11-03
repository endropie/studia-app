<template>
  <q-card>
    <q-card-section>
      <div class="flex flex-row justify-center gap-2">
        <div class="flex-1" style="min-width: 350px">
          <q-stepper
            header-nav
            animated
            vertical
            v-model="step"
            ref="stepper"
            done-color="deep-orange"
            active-color="purple"
            inactive-color="secondary"
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
                  color="blue-grey"
                  flat
                  bordered
                  style="max-width: 400px"
                  @added="setFrameFn"
                >
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
                  color="blue-grey"
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
                        <div class="q-uploader__title">Choice your files</div>
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
                        class="flex-none"
                        separator
                        style="width: 100px; border-right-width: 1px"
                      >
                        <q-item
                          clickable
                          v-ripple
                          v-for="(photo, pIndex) in frame.photos"
                          :key="pIndex"
                          active-class="bg-blue-grey-2"
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
                          <div class="flex flex-row justify-evenly gap-4">
                            <div class="flex flex-1 flex-col gap-2">
                              <div class="flex flex-nowrap gap-4 w-40">
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
                              <div class="flex flex-nowrap gap-4 w-40">
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
                              <q-checkbox
                                dense
                                :model-value="
                                  Boolean(frame.photos[photoSelected].ratio)
                                "
                                @update:model-value="
                                  setPhotoRatio(photoSelected)
                                "
                                label="Lock Ratio"
                                color="blue-grey"
                              />
                            </div>

                            <!-- AXIS POSITION -->
                            <div class="flex flex-1 flex-col gap-2">
                              <div class="flex flex-nowrap gap-4 w-40">
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
                              <div class="flex flex-nowrap gap-4 w-40">
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
                        <q-card-actions v-if="frame.photos[photoSelected]?.src">
                          <q-btn
                            color="negative"
                            label="Remove"
                            @click="removePhoto(photoSelected)"
                            :tabindex="-1"
                          />
                          <q-btn
                            color="grey"
                            label="Reset"
                            @click="resetPhotoPosition(photoSelected)"
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
              <q-btn @click="setPrint()" color="deep-orange" label="Print" />
            </q-step>

            <template v-slot:navigation>
              <q-stepper-navigation>
                <q-btn
                  v-if="step < 3"
                  @click="stepper?.next()"
                  color="deep-orange"
                  :label="step === 3 ? 'Finish' : 'Continue'"
                />
                <q-btn
                  v-if="step > 1"
                  flat
                  color="deep-orange"
                  @click="stepper?.previous()"
                  label="Back"
                  class="q-ml-sm"
                />
              </q-stepper-navigation>
            </template>
          </q-stepper>
        </div>
        <div class="flex-1 flex-row justify-center p-4 bg-gray-200">
          <photo-frame
            style="margin: 0 auto"
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
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { QStepper } from 'quasar';
import PhotoFrame from 'src/components/PhotoFrame.vue';
import { MRecord, FrameInterface, PhotoInterface } from 'src/composables/index';
import { convert, elementToPrint } from 'src/boot/photoprint';
export default defineComponent({
  name: 'PhotoSetup',
  components: { PhotoFrame },
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
    const newPhoto = (params?: MRecord<PhotoInterface>): PhotoInterface => {
      const v = Object.assign({
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
      });

      v.ratio = Number(v.width) / Number(v.height);

      return v;
    };

    const frame = ref<FrameInterface>({
      size: '4R',
      image: {
        src: null,
        deg: 0,
        top: 0,
        left: 0,
        fit: true,
      },
      photos: [newPhoto()],
    });

    const original = ref<FrameInterface>(
      JSON.parse(JSON.stringify(frame.value))
    );

    return {
      gridOptions,
      sizeOptions,
      photoSelected,
      stepper,
      step: ref(1),
      frame,
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

        original.value = JSON.parse(JSON.stringify(frame.value));
      },
      setPhotoFn: (files: readonly File[]) => {
        const setPhotoSize = (index: number, file: File) => {
          const img = new Image();
          img.src = window.URL.createObjectURL(file);
          img.onload = () => {
            if (frame.value.photos[index] && img.height && img.width) {
              frame.value.photos[index].ratio = img.width / img.height;

              frame.value.photos[index].height = Math.floor(
                Number(frame.value.photos[index].width) /
                  Number(frame.value.photos[index].ratio)
              );
            }
          };
        };
        return new Promise((resolve) => {
          files.forEach((file) => {
            const index = frame.value.photos.findIndex((e) => !e.src);
            if (index >= 0) {
              frame.value.photos[index].src = URL.createObjectURL(file);
              setPhotoSize(index, file);
              original.value.photos[index] = JSON.parse(
                JSON.stringify(frame.value.photos[index])
              );
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
      resetPhotoPosition: (index: number) => {
        if (frame.value.photos[index] && original.value.photos[index]) {
          frame.value.photos[index].top = original.value.photos[index].top;
          frame.value.photos[index].left = original.value.photos[index].left;
          frame.value.photos[index].deg = original.value.photos[index].deg;
          frame.value.photos[index].width = original.value.photos[index].width;
          frame.value.photos[index].height =
            original.value.photos[index].height;
        }
      },
      setPhotoSelected: (index: number) => {
        photoSelected.value = photoSelected.value === index ? -1 : index;
      },
      setPrint: () => {
        elementToPrint('photoprint');
      },
      removePhoto: (index: number) => {
        if (frame.value.photos[index]?.src) {
          frame.value.photos[index].src = null;
        }
      },
      removePhotos: () => {
        frame.value.photos.forEach((e) => (e.src = null));
      },
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
</style>
