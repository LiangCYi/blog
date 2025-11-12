<template>
  <div class="blog-list">
    <h2>博客文章</h2>
    <div class="articles">
      <div class="article-item">
        <h3>Vue 3 入门</h3>
        <p>Vue 3 的新特性介绍</p>
      </div>
      <div class="article-item">
        <h3>CSS 布局技巧</h3>
        <p>Flexbox 和 Grid 的使用</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// 简单的博客列表组件
</script>

<style scoped>
.blog-list {
  padding: 20px 0;
}

.article-item {
  padding: 15px;
  margin-bottom: 10px;
  background: #f5f5f5;
  border-radius: 4px;
}
</style>