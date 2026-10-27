<template>
  <div class="my-container">
    <van-nav-bar :title="$t('my.title')" />
    <div class="profile-eyebrow">PERSONAL DESK</div>
    <div class="user-info" @click="goToProfile" v-if="isLogin">
      <div class="avatar">
        <van-image
          round
          width="80"
          height="80"
          :src="userStore.getAvatar"
        />
      </div>
      <div class="info">
        <div class="username">{{ userInfo.nickname || userInfo.username }}</div>
        <div class="account">@{{ userInfo.username }}</div>
        <div class="desc" v-if="isLogin">{{ userBio || $t('profile.bio') }}</div>
      </div>
      <van-icon name="arrow" class="arrow-icon" />
    </div>
    <div class="user-info" v-else>
      <div class="avatar">
        <van-image
          round
          width="80"
          height="80"
          src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg"
        />
      </div>
      <div class="info">
        <div class="username">{{ $t('my.notLoggedIn') }}</div>
        <div class="desc">
          <van-button type="primary" size="small" @click="goToLogin" style="margin-right: 10px">{{ $t('my.goToLogin') }}</van-button>
          <van-button type="default" size="small" @click="goToRegister">{{ $t('my.goToRegister') }}</van-button>
        </div>
      </div>
    </div>

    <div class="menu-list">
      <van-cell-group inset>
        <van-cell :title="$t('my.myFavorite')" label="稍后继续阅读" is-link @click="goToFavorite">
          <template #icon><span class="menu-icon red"><van-icon name="star-o" /></span></template>
        </van-cell>
        <van-cell :title="$t('my.browsingHistory')" label="找回最近看过的内容" is-link @click="goToHistory">
          <template #icon><span class="menu-icon blue"><van-icon name="clock-o" /></span></template>
        </van-cell>
        <van-cell :title="$t('my.notifications')" label="重要动态及时提醒" is-link>
          <template #icon><span class="menu-icon amber"><van-icon name="bell" /></span></template>
        </van-cell>
        <van-cell :title="$t('my.settings')" label="主题、语言与偏好" is-link @click="goToSettings">
          <template #icon><span class="menu-icon slate"><van-icon name="setting-o" /></span></template>
        </van-cell>
        <van-cell v-if="isLogin" class="logout-cell" :title="$t('my.logout')" @click="handleLogout" />
      </van-cell-group>
    </div>
    <tab-bar />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useUserStore } from '../store/user';
import { useRouter } from 'vue-router';
import { computed, ref } from 'vue';
import { showDialog, showToast } from 'vant';
import TabBar from '../components/TabBar.vue';
import { useI18n } from 'vue-i18n';

const userStore = useUserStore();
const router = useRouter();
const { t } = useI18n();

// 从store获取用户信息和登录状态
const userInfo = computed(() => userStore.userInfo);
const isLogin = computed(() => userStore.getLoginStatus);
const userBio = computed(() => userStore.getUserBio || t('profile.bio'));

// 跳转到登录页
const goToLogin = () => {
  router.push('/login');
};

// 跳转到注册页
const goToRegister = () => {
  router.push('/register');
};

// 跳转到个人信息页
const goToProfile = () => {
  if (isLogin.value) {
    router.push('/profile');
  }
};

// 跳转到浏览历史页面
const goToHistory = () => {
  if (isLogin.value) {
    router.push('/history');
  } else {
    showToast(t('common.login'));
    router.push('/login');
  }
};

// 跳转到我的收藏页面
const goToFavorite = () => {
  if (isLogin.value) {
    router.push('/favorite');
  } else {
    showToast(t('common.login'));
    router.push('/login');
  }
};

// 跳转到设置页面
const goToSettings = () => {
  router.push('/settings');
};

// 退出登录
const handleLogout = () => {
  showDialog({
    title: t('common.confirm'),
    message: t('my.logout') + '?',
    showCancelButton: true,
  }).then((action) => {
    if (action === 'confirm') {
      userStore.logout();
      router.push('/login');
    }
  });
};

// 获取用户信息
onMounted(async () => {
  try {
    await userStore.getUserInfoDetail();
  } catch (error) {
    console.error('获取用户信息失败:', error);
  }
});
</script>

<style scoped>
.my-container {
  padding-top: 58px;
  padding-bottom: 88px;
  background:
    linear-gradient(180deg, #e9eef6 0, var(--canvas) 260px);
  color: var(--text-color);
  min-height: 100vh;
  box-sizing: border-box;
}

.van-nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 999;
}

.profile-eyebrow {
  margin: 16px 20px 8px;
  color: var(--muted);
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.2em;
}

.user-info {
  display: flex;
  align-items: center;
  min-height: 138px;
  padding: 23px 20px;
  overflow: hidden;
  background:
    radial-gradient(circle at 92% 14%, rgba(255, 255, 255, 0.16), transparent 7rem),
    #172033;
  color: #fff;
  border-radius: var(--radius-lg);
  margin: 0 14px 18px;
  position: relative;
  box-shadow: var(--shadow-lg);
}

.arrow-icon {
  position: absolute;
  right: 16px;
  color: rgba(255, 255, 255, 0.72);
}

.avatar {
  margin-right: 17px;
  padding: 3px;
  border: 1px solid rgba(255, 255, 255, 0.32);
  border-radius: 50%;
}

.info {
  flex: 1;
}

.username {
  margin-bottom: 1px;
  font-family: "Songti SC", "STSong", serif;
  font-size: 22px;
  font-weight: 700;
}

.account {
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.52);
  font-size: 11px;
}

.desc {
  max-width: 360px;
  color: rgba(255, 255, 255, 0.68);
  font-size: 12px;
  line-height: 1.55;
}

.menu-list {
  margin: 0;
}

:deep(.menu-list .van-cell) {
  align-items: center;
  min-height: 70px;
}

:deep(.menu-list .van-cell__label) {
  margin-top: 3px;
  color: var(--muted);
  font-size: 11px;
}

.menu-icon {
  display: grid;
  width: 36px;
  height: 36px;
  margin-right: 12px;
  place-items: center;
  border-radius: 12px;
  font-size: 18px;
}

.menu-icon.red { color: var(--accent); background: var(--accent-soft); }
.menu-icon.blue { color: var(--blue); background: var(--blue-soft); }
.menu-icon.amber { color: #c77b16; background: #fff5df; }
.menu-icon.slate { color: #596579; background: #eef1f5; }

:deep(.logout-cell .van-cell__title) {
  color: var(--accent);
  text-align: center;
}
</style>
