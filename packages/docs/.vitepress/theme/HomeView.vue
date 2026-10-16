<!-- docs/components/HomePage.vue -->
<script setup lang="ts">
</script>

<template>
  <div class="home-page">
    <!-- 简洁 Header -->
    <header class="header">
      <div class="logo">
        <span class="logo-text">Luckydown</span>
      </div>
      <div class="nav">
        <a href="/docs">文档</a>
        <a href="https://github.com" target="_blank">GitHub</a>
      </div>
    </header>

    <!-- 简短介绍 -->
    <section class="intro">
      <h1>
        <span class="gradient">Luckydown</span>
      </h1>
      <p>优雅的富文本编辑器，为创作而生</p>
    </section>

    <!-- 编辑器主体 -->
    <section class="editor-container">
      <Luckydown placeholder="来写点什么吧..." />
    </section>

    <!-- 简单 Footer -->
    <footer class="footer">
      <p>Powerd by @tiptap & @zhixia</p>
    </footer>
  </div>
</template>

<style>
.home-page {
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #f8f9fc 0%, #f0f2f8 100%);
  display: flex;
  flex-flow: column;
  overflow: hidden;
}

/* Header */
.header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  margin: 0 auto;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.nav {
  display: flex;
  gap: 24px;
}

.nav a {
  text-decoration: none;
  color: #555;
  transition: color 0.2s;
}

.nav a:hover {
  color: #667eea;
}

/* Intro */
.intro {
  text-align: center;
  padding: 40px 20px 20px;
}

.intro h1 {
  height: 48px;
  font-size: 48px;
  font-weight: 800;
}

.gradient {
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.intro p {
  font-size: 16px;
  color: #666;
}

/* 编辑器区域 */
.editor-container {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  min-width: 800px;
  margin: 0 10rem;
  border-radius: 12px;
  flex: 1;
  display: flex;
  min-height: 0;
  overflow: hidden;
}

/* Footer */
.footer {
  text-align: center;
  padding: 40px 20px;
  color: #888;
  font-size: 14px;
}
</style>