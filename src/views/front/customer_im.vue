<template>
<div class="home-TUIKit-main">
    <div class="conversation">
        <TUISearch class="TUIKit-search" />
        <TUIConversation />
    </div>
    <div class="TUIKit-chat">
        <TUIChat/>
    </div>
</div>

</template>

<script lang="ts" setup>
    import { reactive, ref, Ref, getCurrentInstance, toRefs } from 'vue';
    import { TUIEnv } from '../../TUIKit/TUIPlugin';
    //初始化TUIKit环境
    const data = reactive({
        env: TUIEnv(),
    });

    const { proxy } = getCurrentInstance();
    proxy.$http("/front/customer/im/createAccount", "GET", null, true, function (resp) {
        let result = resp.result
        let account = result.account;
        let sdkAppId = result.sdkAppId
        let userSig = result.userSig
        //登陆客户IM账号
        TUIKit.login({
            userID: account,
            userSig: userSig,
        });
    })
</script>


<style lang="less">
	@import url("customer_im.less");
</style>