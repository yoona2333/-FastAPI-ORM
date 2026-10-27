<template>
  <div class="app">
    <router-view v-slot="{ Component }">
      <template v-if="$route.meta.keepAlive">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </template>
      <template v-else>
        <component :is="Component" />
      </template>
    </router-view>
  </div>
</template>

<script setup>
// App.vue 作为根组件
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  min-height: 100%;
  width: 100%;
}

.app {
  position: relative;
  max-width: 720px;
  min-height: 100vh;
  margin: 0 auto;
  overflow: hidden;
  background: var(--canvas);
  box-shadow: 0 0 64px rgba(23, 32, 51, 0.12);
}

@media screen and (max-width: 720px) {
  .app {
    box-shadow: none;
  }
}
</style>
