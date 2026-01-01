<template>
  <el-select
    v-model="selectedCity"
    filterable
    clearable
    placeholder="选择城市"
    :style="{ width: width || '200px' }"
    @change="handleChange"
  >
    <!-- 热门城市 -->
    <el-option-group v-if="hotCities.length > 0" label="热门城市">
      <el-option v-for="city in hotCities" :key="city.code" :label="city.name" :value="city.name" />
    </el-option-group>

    <!-- 按首字母分组 -->
    <el-option-group v-for="group in cityGroups" :key="group.initial" :label="group.initial">
      <el-option
        v-for="city in group.cities"
        :key="city.code"
        :label="`${city.name} (${city.province})`"
        :value="city.name"
      />
    </el-option-group>
  </el-select>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { getCityGroups, getHotCities, type City, type CityGroup } from '@/api/city'

interface Props {
  modelValue?: string
  width?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [city: City | null]
}>()

const selectedCity = ref(props.modelValue || '')
const hotCities = ref<City[]>([])
const cityGroups = ref<CityGroup[]>([])
const loading = ref(false)

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  newValue => {
    selectedCity.value = newValue || ''
  }
)

// 加载城市数据
async function loadCities() {
  if (loading.value) return

  loading.value = true
  try {
    const [hot, groups] = await Promise.all([getHotCities(), getCityGroups()])
    hotCities.value = hot
    cityGroups.value = groups
  } catch (error) {
    console.error('加载城市数据失败:', error)
  } finally {
    loading.value = false
  }
}

function handleChange(value: string) {
  emit('update:modelValue', value)

  // 查找选中的城市对象
  let selectedCityObj: City | null = null
  if (value) {
    selectedCityObj = hotCities.value.find(c => c.name === value) || null
    if (!selectedCityObj) {
      for (const group of cityGroups.value) {
        selectedCityObj = group.cities.find(c => c.name === value) || null
        if (selectedCityObj) break
      }
    }
  }

  emit('change', selectedCityObj)
}

onMounted(() => {
  loadCities()
})
</script>

<style scoped lang="scss">
// 城市选择器样式
</style>
