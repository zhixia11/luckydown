---
layout: page
class: no-sidebar
---

<ClientOnly>
  <div class="playground-container">
    <Luckydown placeholder="来写点什么吧..." v-model="data"  class="demo-container"/>
    <div class="preview-container">
      <h3>实时预览结果：</h3>
      <pre><code>{{ data }}</code></pre>
    </div>
  </div>
</ClientOnly>

<script setup lang="ts">
import { shallowRef } from 'vue'

const data = shallowRef({})
</script>

<style>
.playground-container {
  height: calc(100vh - 64px);
  padding: 1rem;
  overflow: auto;
  display:flex;
  flex-flow: column;
}
.demo-container{
  height: 40vh;
}
.preview-container{
  flex: 1;
  overflow: auto;
  border-top: 1px solid #ccc;
  padding: 1rem;
  display: flex;
  flex-direction: column;
}
.preview-container pre{
  flex: 1;
  overflow: auto;
  background: #f4f4f4;
  padding: 10px;
  border-radius: 4px;
}
</style>
