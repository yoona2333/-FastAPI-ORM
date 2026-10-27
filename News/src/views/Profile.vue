<template>
  <div class="profile-page">
    <van-nav-bar
      title="个人信息"
      left-arrow
      @click-left="$router.back()"
      fixed
    />
    
    <div class="profile-container">
      <van-cell-group inset class="avatar-group">
        <van-cell title="头像" label="点击更换头像" center is-link @click="openAvatarPicker">
          <template #right-icon>
            <div class="avatar-upload">
              <van-image round width="66" height="66" :src="avatarUrl" />
              <span class="avatar-edit"><van-icon name="photograph" /></span>
            </div>
          </template>
        </van-cell>
        <input
          ref="avatarInput"
          class="avatar-file-input"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          @change="handleAvatarChange"
        />
      </van-cell-group>
      
      <van-cell-group inset class="info-group">
        <van-cell title="用户名" :value="userInfo.username || '未设置'" is-link @click="showUsernameDialog" />
        <van-cell title="账号ID" :value="`ID: YOONA-${userId || 'N/A'}`" />
        <van-cell title="个人简介" :value="userBio || '暂无简介'" is-link @click="showBioDialog" />
      </van-cell-group>
      
      <van-cell-group inset class="security-group">
        <van-cell title="修改密码" is-link @click="showPasswordConfirm" />
      </van-cell-group>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, h, onMounted } from 'vue';
import { useUserStore } from '../store/user';
import { showDialog, showToast, showLoadingToast, showSuccessToast, showFailToast } from 'vant';
import { useRouter } from 'vue-router';

const router = useRouter();
const userStore = useUserStore();

// 初始化用户状态
onMounted(async () => {
  // 如果用户未登录，跳转到登录页面
  if (!userStore.getLoginStatus) {
    router.push('/login');
    return;
  }
  
  // 获取用户信息
  try {
    // 显示加载提示
    const loadingInstance = showLoadingToast({
      message: '加载中...',
      forbidClick: true,
      duration: 0
    });
    
    // console.log('获取用户信息，当前token:', userStore.token);
    
    // 使用新的 getUserInfoDetail 方法
    const result = await userStore.getUserInfoDetail();
    
    // 手动关闭加载提示
    loadingInstance.close();
    
    if (result.success) {
      console.log('获取用户信息成功:', userStore.userInfo);
      // 显示成功提示
      // showSuccessToast('获取用户信息成功');
    } else {
      console.error('获取用户信息失败:', result.message);
      showFailToast(result.message || '获取用户信息失败');
    }
  } catch (error) {
    console.error('获取用户信息请求失败:', error);
    // 确保关闭加载提示
    showToast.clear();
    showToast.fail('获取用户信息失败');
  }
});

const userInfo = computed(() => userStore.userInfo || {});
const userId = computed(() => userStore.token ? userStore.token.substring(0, 5) : '');
const userBio = computed(() => userStore.userInfo?.bio || '暂无简介');
const avatarUrl = computed(() => userStore.getAvatar);
const avatarInput = ref(null);

const showUsernameDialog = () => {
  const newUsername = ref(userInfo.value.username || '');

  showDialog({
    title: '修改用户名',
    showCancelButton: true,
    confirmButtonText: '保存',
    message: h('div', { style: 'padding: 10px 0; text-align: left;' }, [
      h('div', { style: 'margin-bottom: 6px; color: #526074; font-size: 13px;' }, '新用户名'),
      h('input', {
        value: newUsername.value,
        maxlength: 50,
        autocomplete: 'username',
        placeholder: '请输入 3—50 个字符',
        onInput: (event) => { newUsername.value = event.target.value },
        style: 'width: 100%; padding: 10px 12px; border: 1px solid #dcdee0; border-radius: 10px; box-sizing: border-box; outline: none;'
      })
    ])
  }).then(async () => {
    const username = newUsername.value.trim();
    if (username.length < 3 || username.length > 50) {
      showFailToast('用户名长度应为 3—50 个字符');
      return;
    }
    if (username === userInfo.value.username) {
      showToast('用户名没有变化');
      return;
    }

    const loading = showLoadingToast({ message: '保存中...', forbidClick: true, duration: 0 });
    const result = await userStore.updateUsername(username);
    loading.close();
    if (result.success) showSuccessToast(result.message);
    else showFailToast(result.message);
  }).catch(() => {});
};

const openAvatarPicker = () => {
  avatarInput.value?.click();
};

const handleAvatarChange = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    showFailToast('仅支持 JPG、PNG 或 WebP 图片');
    event.target.value = '';
    return;
  }
  if (file.size > 3 * 1024 * 1024) {
    showFailToast('头像大小不能超过 3MB');
    event.target.value = '';
    return;
  }

  const loadingInstance = showLoadingToast({
    message: '上传头像中...',
    forbidClick: true,
    duration: 0
  });

  const result = await userStore.uploadAvatar(file);
  loadingInstance.close();
  event.target.value = '';
  if (result.success) {
    showSuccessToast(result.message);
  } else {
    showFailToast(result.message);
  }
};

const showPasswordConfirm = () => {
  // 使用ref创建响应式变量
  const oldPassword = ref('');
  const newPassword = ref('');
  const confirmPassword = ref('');
  
  showDialog({
    title: '修改密码',
    showCancelButton: true,
    className: 'password-dialog',
    message: h('div', { style: 'text-align: left; padding: 10px 0;' }, [
      h('div', { style: 'margin-bottom: 15px;' }, [
        h('div', { style: 'margin-bottom: 5px; text-align: left;' }, '当前密码：'),
        h('input', {
          type: 'password',
          value: oldPassword.value,
          onInput: (e) => { oldPassword.value = e.target.value },
          style: 'width: 100%; border: 1px solid #dcdee0; border-radius: 4px; padding: 8px; box-sizing: border-box;'
        })
      ]),
      h('div', { style: 'margin-bottom: 15px;' }, [
        h('div', { style: 'margin-bottom: 5px; text-align: left;' }, '新密码：'),
        h('input', {
          type: 'password',
          value: newPassword.value,
          onInput: (e) => { newPassword.value = e.target.value },
          style: 'width: 100%; border: 1px solid #dcdee0; border-radius: 4px; padding: 8px; box-sizing: border-box;'
        })
      ]),
      h('div', { style: 'margin-bottom: 15px;' }, [
        h('div', { style: 'margin-bottom: 5px; text-align: left;' }, '确认密码：'),
        h('input', {
          type: 'password',
          value: confirmPassword.value,
          onInput: (e) => { confirmPassword.value = e.target.value },
          style: 'width: 100%; border: 1px solid #dcdee0; border-radius: 4px; padding: 8px; box-sizing: border-box;'
        })
      ])
    ]),
  }).then(async () => {
    // 点击确认按钮
    if (!oldPassword.value) {
      showToast('请输入当前密码');
      return;
    }
    
    if (!newPassword.value) {
      showToast('请输入新密码');
      return;
    }
    
    if (newPassword.value !== confirmPassword.value) {
      showToast('两次密码输入不一致');
      return;
    }
    
    try {
      // 显示加载提示
      const loadingInstance = showLoadingToast({
        message: '修改中...',
        forbidClick: true,
        duration: 0
      });
      
      // 调用API更新密码
      const result = await userStore.updatePassword(oldPassword.value, newPassword.value);
      
      // 关闭加载提示
      loadingInstance.close();
      
      if (result && result.success) {
        showSuccessToast('密码修改成功');
      } else {
        showFailToast((result && result.message) || '密码修改失败');
      }
    } catch (error) {
      console.error('修改密码失败:', error);
      showToast.clear();
      showToast.fail('密码修改失败');
    }
  }).catch(() => {
    // 点击取消按钮
  });
};

const showBioDialog = () => {
  // 使用ref创建响应式变量
  const newBioValue = ref(userBio.value);
  
  showDialog({
    title: '修改个人简介',
    showCancelButton: true,
    confirmButtonText: '确认',
    className: 'bio-dialog',
    message: h('div', { style: 'text-align: left; padding: 10px 0;' }, [
      h('div', { style: 'margin-bottom: 15px;' }, [
        h('div', { style: 'margin-bottom: 5px; text-align: left;' }, '个人简介：'),
        h('textarea', {
          value: newBioValue.value,
          onInput: (e) => { newBioValue.value = e.target.value },
          style: 'width: 100%; border: 1px solid #dcdee0; border-radius: 4px; padding: 8px; box-sizing: border-box; min-height: 100px; resize: vertical;'
        })
      ])
    ])
  }).then(async () => {
    // 点击确认按钮
    try {
      // 显示加载提示
      const loadingInstance = showLoadingToast({
        message: '保存中...',
        forbidClick: true,
        duration: 0
      });
      
      console.log('更新个人简介:', newBioValue.value);
      
      // 调用API更新个人简介
      const result = await userStore.updateUserBio(newBioValue.value);
      
      // 关闭加载提示
      loadingInstance.close();
      
      if (result && result.success) {
        showSuccessToast('个人简介修改成功');
      } else {
        showFailToast((result && result.message) || '个人简介修改失败');
      }
    } catch (error) {
      console.error('更新个人简介失败:', error);
      showToast.clear();
      showToast.fail('个人简介修改失败');
    }
  }).catch(() => {
    // 点击取消按钮
  });
};
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background:
    linear-gradient(180deg, #e9eef6 0, var(--canvas) 250px);
}

.profile-container {
  padding-top: 62px;
  padding-bottom: 36px;
}

.avatar-group,
.info-group,
.security-group {
  margin-top: 14px;
}

:deep(.avatar-group) {
  border: 0;
  background: #172033;
  box-shadow: var(--shadow-lg);
}

:deep(.avatar-group .van-cell) {
  min-height: 98px;
  color: #fff;
  background: transparent;
}

:deep(.avatar-group .van-cell__title) {
  font-family: "Songti SC", "STSong", serif;
  font-size: 20px;
  font-weight: 700;
}

.avatar-upload {
  position: relative;
  display: flex;
  padding: 3px;
  border: 1px solid rgba(255, 255, 255, 0.34);
  border-radius: 50%;
}

.avatar-file-input {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
}

:deep(.avatar-group .van-cell__label) {
  color: rgba(255, 255, 255, 0.52);
  font-size: 11px;
}

:deep(.avatar-group .van-cell__right-icon) {
  align-self: center;
  margin-left: 10px;
  color: rgba(255, 255, 255, 0.5);
}

.avatar-edit {
  position: absolute;
  right: -2px;
  bottom: -2px;
  display: grid;
  width: 24px;
  height: 24px;
  place-items: center;
  border: 2px solid #172033;
  border-radius: 50%;
  color: #fff;
  background: var(--accent);
  font-size: 13px;
}

:deep(.info-group .van-cell),
:deep(.security-group .van-cell) {
  min-height: 60px;
  align-items: center;
}

:deep(.info-group .van-cell__title),
:deep(.security-group .van-cell__title) {
  color: var(--ink);
  font-weight: 650;
}

:deep(.info-group .van-cell__value) {
  color: var(--muted);
}

.password-dialog .van-dialog__content {
  padding: 20px;
}

.password-form .form-item {
  margin-bottom: 15px;
  text-align: left;
}

.password-form .form-item span {
  display: block;
  margin-bottom: 5px;
  text-align: left;
}

.password-form .password-input {
  width: 100%;
  border: 1px solid #dcdee0;
  border-radius: 12px;
  padding: 8px;
  outline: none;
  box-sizing: border-box;
}
</style>
