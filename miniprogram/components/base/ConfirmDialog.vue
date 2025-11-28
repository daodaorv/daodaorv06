<template>
	<uni-popup ref="popup" type="dialog">
		<uni-popup-dialog 
			:type="type"
			:mode="mode"
			:title="title" 
			:content="content"
			:placeholder="placeholder"
			:before-close="true"
			@confirm="handleConfirm"
			@close="handleClose"
		>
		</uni-popup-dialog>
	</uni-popup>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
	type?: 'success' | 'error' | 'warn' | 'info';
	mode?: 'base' | 'input';
	title?: string;
	content?: string;
	placeholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
	type: 'info',
	mode: 'base',
	title: '提示',
	content: '',
	placeholder: ''
});

const emit = defineEmits(['confirm', 'close']);

const popup = ref();

const open = () => {
	popup.value?.open();
};

const close = () => {
	popup.value?.close();
};

const handleConfirm = (value?: string) => {
	emit('confirm', value);
	close();
};

const handleClose = () => {
	emit('close');
};

defineExpose({
	open,
	close
});
</script>

<style scoped lang="scss">
// uni-popup样式由uni-ui提供
</style>
