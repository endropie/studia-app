<template>
  <div :id="$props.id || 'photoprint'">
    <q-card
      square
      flat
      v-for="n in 1"
      :key="n"
      :style="{
        width: $props.modelValue?.width || 'calc(4in)',
        height: $props.modelValue?.height || 'calc(6in)',
        overflow: 'hidden',
        position: 'relative',
        margin: '0 auto',
      }"
    >
      <div
        :style="{
          position: 'absolute',
          zIndex: 100,
          width: '100%',
          height: '100%',
        }"
      >
        <img
          :src="$props.modelValue?.image.src || srcDefaultFrame"
          style="width: 100%; height: 100%"
        />
      </div>
      <vueDragResizeRotate
        v-for="(photo, index) in $props.modelValue?.photos"
        :key="index"
        :isActive="photoSelected === index"
        v-show="Boolean(photo.src)"
        :isRotatable="Boolean(photo.src)"
        :isResizable="Boolean(photo.src)"
        :isDraggable="Boolean(photo.src)"
        :w="Number(photo.width)"
        :h="Number(photo.height)"
        :x="Number(photo.left)"
        :y="Number(photo.top)"
        :deg="Number(photo.deg)"
        :zindex="index"
        :mode="photo.mode"
        :gridX="5"
        :gridY="5"
        :aspectRatio="Boolean(photo.ratio)"
        :snapToGrid="true"
        :parentLimitation="false"
        @rotating="(x) => onRotate(index, x)"
        @resizing="(x) => onResize(index, x)"
        @dragging="(x) => onPosition(index, x)"
        class="photoset"
        style="position: absolute"
        :style="{
          zIndex: photoSelected === index && !disable ? 101 : 'inherit',
        }"
      >
        <img
          :src="photo.src || srcDefaultPhoto"
          style="width: 100%; height: 100%"
          :style="{
            opacity: photoSelected === index ? 0.85 : 1,
            backgroundColor: '#5e5e5e',
          }"
        />
      </vueDragResizeRotate>
    </q-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import vueDragResizeRotate from '@pinkcao/vue-drag-resize-rotate/packages/vueDragResizeRotate/vueDragResizeRotate.vue';
import { FrameInterface } from 'src/composables';

export default defineComponent({
  name: 'PhotoFrame',
  components: { vueDragResizeRotate },
  emits: ['resize', 'rotate', 'update:modelValue'],
  props: {
    id: String,
    disable: Boolean,
    photoSelected: Number,
    modelValue: Object as PropType<FrameInterface>,
  },
  setup(props, vm) {
    return {
      srcDefaultFrame: 'images/frames/default.png',
      srcDefaultPhoto: 'images/person.png',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onPosition: (i: number, v: any) => {
        const photos = props.modelValue?.photos || [];
        if (photos[i]) {
          photos[i].top = Number(v.top);
          photos[i].left = Number(v.left);
        }
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onResize: (i: number, v: any) => {
        const photos = props.modelValue?.photos || [];
        if (photos[i]) {
          photos[i].width = Number(v.width);
          photos[i].height = Number(v.height);
        }

        vm.emit('update:modelValue', {
          ...props.modelValue,
          photos,
        });
      },
      onRotate: (i: number, v: unknown) => {
        const photos = props.modelValue?.photos || [];
        if (photos[i]) photos[i].deg = Number(v);

        vm.emit('update:modelValue', {
          ...props.modelValue,
          photos,
        });
      },
    };
  },
});
</script>

<style>
.photoset.vdr.active {
  outline: dashed 1px #575757;
}
</style>
