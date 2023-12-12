<script setup lang="ts">
import "../assets/github-markdown-light.css";
import { nextTick, ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus'
import 'element-plus/es/components/message/style/css'
import { marked } from 'marked';
import { computed } from '@vue/reactivity';
import html2canvas from 'html2canvas';

const props = defineProps(["title", "desc", "content", "copy"])
/** @type {ref<string>} 输入的原始内容 */
const source = ref(props.content || '');
const cardConfig = ref({
  title: props.title || '稻米鼠的笔记小卡片（鼠片）',
  desc: props.desc || '本卡片由 @稻米鼠 的 Share Card 工具创建。',
  width: '480',
  fontSize: '18',
})
/** @type {ref<string>} 模式 */
const mode = ref('Editing');
/** @type {computed<string>} 卡片样式 **/
const previewStyle = computed(()=>{
  return `width: ${cardConfig.value.width}px; font-size: ${cardConfig.value.fontSize}px;`
})
/** @type {computed<string>} 用于预览的代码 */
const previewCode = computed(()=>{
  return marked.parse(source.value.trim())
})
const preview = ref<HTMLDivElement>()
const canvas_area = ref<HTMLDivElement>()
// 复制图片到剪切板
const copyImage = (canvas: HTMLCanvasElement) => {
  navigator.permissions.query({ name: 'clipboard-write' } as any ).then(result => {
    if (result.state === 'granted') {
      const imageType = 'png';
      canvas.toBlob(function deal(blob) {
        const clipboardItem = new ClipboardItem({ [`image/${imageType}`]: blob } as any);
        navigator.clipboard.write([clipboardItem]).then(() => {
          ElMessage({
            message: '图片已复制到剪切板',
            type: 'success',
          })
        });
      }, imageType);
    }
  });
}

const generateImage = async()=>{
  /** 模式变化 **/
  mode.value = 'Preview'
  /** 样式修补， markdown-body 的第一个和最后一个元素的外补 **/
  const AllChildren = preview.value!.querySelectorAll('.markdown-body > *')
  if(AllChildren.length){
    AllChildren[0].setAttribute('style', 'margin-top: 0')
    AllChildren[AllChildren.length-1].setAttribute('style', 'margin-bottom: 0')
  }
  /** 等待样式修补生效 **/
  await nextTick()
  /** 生成图片 **/
  html2canvas(preview.value!, { scale:2 }).then(function(canvas) {
    canvas_area.value!.innerHTML = ''
    canvas_area.value!.appendChild(canvas)
    copyImage(canvas)
    canvas_area.value!.innerHTML = `<img src="${canvas.toDataURL()}" style="width: 100%">`
    mode.value = 'ShowImage'
  });
  return
}

onMounted(() => {
  if(props.copy) {
    generateImage()
  }
})
</script>

<template>
  <el-row justify="center">
    <el-col :xs="24" :sm="18" :md="12" :lg="8" :xl="6">
      <h1>Share Card</h1>
      <el-collapse-transition>
        <el-form
          ref="form"
          label-width="auto"
          label-position="left"
          v-show="mode==='Editing'">
          <el-form-item>
            <el-input
              id="source"
              type="textarea"
              :autosize="{ minRows: 10, maxRows: 18 }"
              placeholder="Enter your markdown here"
              autofocus
              resize="none"
              v-model="source"
            />
          </el-form-item>
          <el-form-item label="卡片标题：">
            <el-input
              name="card-title"
              id="card-title"
              v-model="cardConfig.title"
            />
          </el-form-item>
          <el-form-item label="卡片描述：">
            <el-input
              name="card-title"
              id="card-title"
              placeholder="这里是一些简单的描述信息，大概能容纳两行。"
              v-model="cardConfig.desc"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              style="width: 100%"
              @click="generateImage"
              icon="Printer">Generate Image</el-button>
          </el-form-item>
        </el-form>
      </el-collapse-transition>
      <el-form-item v-show="mode!=='Editing'">
        <el-button
            type="success"
            size="large"
            style="width: 100%"
            @click="()=>mode='Editing'"
            icon="Edit">Back to Edit</el-button>
      </el-form-item>
      <div id="preview"
        ref="preview"
        :style="previewStyle"
        v-show="mode==='Preview'" >
        <div class="card">
          <div class="content markdown-body" v-html="previewCode"></div>
          <div class="horizontalLine"></div>
          <div class="cardInfo">
            <div class="info">
              <div class="title">{{cardConfig.title}}</div>
              <div class="desc">{{cardConfig.desc}}</div>
            </div>
            <div class="logo">
              <img src="@/assets/obsidian-icon.svg" alt="Logo">
            </div>
          </div>
        </div>
      </div>
      <div id="canvasArea"
        v-show="mode==='ShowImage'"
        ref="canvas_area">
      </div>
    </el-col>
  </el-row>
</template>

<style scoped>
#preview {
  width: 480px;
  margin: 1rem auto;
  padding: 2rem;
  background-image: linear-gradient( 135deg, #FFD3A5 10%, #FD6585 100%);
}
#preview > .card {
  background-color: rgba(255, 255, 255, .9);
  backdrop-filter: blur(32px);
}
#preview > .card > .content {
  background-color: rgba(255, 255, 255, 1);
  padding: 2rem 2rem;
  backdrop-filter: blur(32px);
  font-size: 18px;
}
#preview > .card > .horizontalLine {
  background-image: linear-gradient( 135deg, #79F1A4 10%, #0E5CAD 100%);
  height: .4rem;
}
#preview > .card > .cardInfo {
  display: flex;
  padding: 1rem 2rem;
}
#preview > .card > .cardInfo > .info {
  margin: 0;
  font-size: 1em;
  line-height: 1.2;
  flex-grow: 1;
  font-family: -apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji";
}
#preview > .card > .cardInfo > .info > .title {
  font-weight: bold;
}
#preview > .card > .cardInfo > .info > .desc {
  font-size: 16px;
  opacity: .8;
  padding: .5rem 0;
}
#preview > .card > .cardInfo .logo {
  width: 20%;
  flex-shrink: 0;
  margin-left: 1rem;
}
#preview > .card > .cardInfo .logo > img {
  max-width: 100%;
  max-height: 100%;
}
#canvasArea {
  text-align: center;
}
</style>
