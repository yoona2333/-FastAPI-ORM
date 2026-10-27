<template>
  <div class="register-page">
    <van-nav-bar
      title="用户注册"
      left-arrow
      @click-left="onClickLeft"
      fixed
    />
    
    <div class="register-container">
      <div class="register-logo">
        <div class="brand-seal">闻</div>
        <div class="brand-kicker">JOIN THE NEWSROOM</div>
        <h2>创建你的阅读档案</h2>
        <p>收藏关心的内容，让每次阅读都有迹可循</p>
      </div>
      
      <van-form @submit="onSubmit" class="register-form">
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
          <van-field
            v-model="confirmPassword"
            type="password"
            name="confirmPassword"
            label="确认密码"
            placeholder="请再次输入密码"
            :rules="[
              { required: true, message: '请确认密码' },
              { validator: validatePassword, message: '两次密码不一致' }
            ]"
          />
        </van-cell-group>
        
        <div class="submit-btn">
          <van-button round block type="primary" native-type="submit" size="large">
            注册
          </van-button>
        </div>
        
        <div class="login-link">
          已有账号？<span @click="goToLogin">去登录</span>
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
const confirmPassword = ref('');

// 验证两次密码是否一致
const validatePassword = () => {
  return password.value === confirmPassword.value;
};

const onSubmit = async () => {
  // 显示加载提示
  showToast({
    type: 'loading',
    message: '注册中...',
    forbidClick: true,
    duration: 0
  });
  
  try {
    // 调用API注册
    const result = await userStore.register({
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
      message: '注册失败，请稍后再试'
    });
  }
};

const onClickLeft = () => {
  router.back();
};

const goToLogin = () => {
  router.push('/login');
};
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 50% 0%, rgba(219, 59, 66, 0.1), transparent 22rem),
    var(--canvas);
}

.register-container {
  padding-top: 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.register-logo {
  margin: 24px 0 28px;
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
  background: var(--accent);
  box-shadow: 0 14px 32px rgba(219, 59, 66, 0.22);
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

.register-logo h2 {
  margin: 8px 0 6px;
  color: var(--ink);
  font-family: "Songti SC", "STSong", serif;
  font-size: 25px;
}

.register-logo p {
  color: var(--muted);
  font-size: 12px;
}

.register-form {
  width: 100%;
  max-width: 520px;
  padding: 0 10px;
}

:deep(.register-form .van-cell-group) {
  border-radius: 20px;
}

:deep(.register-form .van-field) {
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

.login-link {
  text-align: center;
  margin-top: 16px;
  color: var(--muted);
  font-size: 14px;
}

.login-link span {
  color: var(--accent);
  font-weight: 700;
  cursor: pointer;
}
</style>
