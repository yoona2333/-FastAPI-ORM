<template>
  <div class="login-page">
    <van-nav-bar
      title="用户登录"
      left-arrow
      @click-left="onClickLeft"
      fixed
    />
    
    <div class="login-container">
      <div class="login-logo">
        <div class="brand-seal">闻</div>
        <div class="brand-kicker">NEWSROOM ACCESS</div>
        <h2>欢迎回来</h2>
        <p>登录后同步收藏、历史与 AI 问答记录</p>
      </div>
      
      <van-form @submit="onSubmit" class="login-form">
        <van-cell-group inset>
          <van-field
            v-model="username"
            name="username"
            label="用户名"
            placeholder="请输入用户名"
            :rules="[{ required: true, message: '请填写用户名' }]"
          />
          <van-field
            v-model="password"
            type="password"
            name="password"
            label="密码"
            placeholder="请输入密码"
            :rules="[{ required: true, message: '请填写密码' }]"
          />
        </van-cell-group>
        
        <div class="submit-btn">
          <van-button round block type="primary" native-type="submit" size="large">
            登录
          </van-button>
        </div>
        
        <div class="login-tips">
          还没有账号？<span @click="router.push('/register')">立即注册</span>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { useUserStore } from '../store/user';

const router = useRouter();
const userStore = useUserStore();

const username = ref('');
const password = ref('');

const onSubmit = async (values) => {
  // 显示加载提示
  showToast({
    type: 'loading',
    message: '登录中...',
    forbidClick: true,
    duration: 0
  });
  
  try {
    // 调用API登录
    const result = await userStore.login({
      username: username.value,
      password: password.value
    });
    
    if (result.success) {
      showToast({
        type: 'success',
        message: result.message
      });
      
      router.push('/');
    } else {
      showToast({
        type: 'fail',
        message: result.message
      });
    }
  } catch (error) {
    showToast({
      type: 'fail',
      message: '登录失败，请稍后再试'
    });
  }
};

const onClickLeft = () => {
  router.back();
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 50% 0%, rgba(36, 87, 214, 0.12), transparent 22rem),
    var(--canvas);
}

.login-container {
  padding-top: 76px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-logo {
  margin: 28px 0 32px;
  padding: 0 24px;
  text-align: center;
}

.brand-seal {
  display: grid;
  width: 68px;
  height: 68px;
  margin: 0 auto 14px;
  place-items: center;
  border-radius: 22px;
  color: #fff;
  background: var(--ink);
  box-shadow: 0 14px 32px rgba(23, 32, 51, 0.2);
  font-family: "Songti SC", "STSong", serif;
  font-size: 32px;
  font-weight: 800;
}

.brand-kicker {
  color: var(--accent);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.18em;
}

.login-logo h2 {
  margin: 8px 0 6px;
  color: var(--ink);
  font-family: "Songti SC", "STSong", serif;
  font-size: 27px;
}

.login-logo p {
  color: var(--muted);
  font-size: 12px;
}

.login-form {
  width: 100%;
  max-width: 520px;
  padding: 0 10px;
}

:deep(.login-form .van-cell-group) {
  border-radius: 20px;
}

:deep(.login-form .van-field) {
  min-height: 62px;
}

.submit-btn {
  margin: 22px 16px;
}

.submit-btn :deep(.van-button) {
  height: 50px;
  border-radius: 16px;
  font-weight: 750;
  letter-spacing: 0.12em;
}

.login-tips {
  text-align: center;
  color: var(--muted);
  font-size: 14px;
  margin-top: 16px;
}

.login-tips span {
  color: var(--accent);
  font-weight: 700;
  cursor: pointer;
}
</style>
