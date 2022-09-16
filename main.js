import Vue from 'vue';
import App from './App.vue';
import router from './router';
import ElementUI from 'element-ui';
import VueI18n from 'vue-i18n';
import axios from 'axios';
import qs from 'qs';
import {
    messages
} from './components/common/i18n';
import 'element-ui/lib/theme-chalk/index.css'; // 默认主题
// import './assets/css/theme-green/index.css'; // 浅绿色主题
import './assets/css/icon.css';
import './components/common/directives';
import 'babel-polyfill';

import {
    showLoading,
    hideLoading
} from './components/common/loading.js';

//引入百度富文本编辑器
import '../src/assets/ue/ueditor.config.js'

import '../src/assets/ue/ueditor.all.min.js'

import '../src/assets/ue/lang/zh-cn/zh-cn.js'

import '../src/assets/ue/themes/default/css/ueditor.css'
// import '../src/assets/ue/ueditor.parse.min.js'
import vcolorpicker from 'vcolorpicker'
Vue.use(vcolorpicker)
Vue.config.productionTip = false;
Vue.use(VueI18n);
Vue.use(ElementUI, {
    size: 'small'
});
const i18n = new VueI18n({
    locale: 'zh',
    messages
});


//备注 修改baseURL的时候需要搜索（http://msmtest.ishare-go.com）全局修改 以及$url
console.log(process.env.VUE_APP_API_ROOT,'process.env.VUE_APP_API_ROOT,')
let baseURL=process.env.VUE_APP_API_ROOT   //自动识别环境
axios.defaults.withCredentials = true;
let instance = axios.create({
    baseURL: baseURL, //test分支 ==> 请求基地址1
    // baseURL: 'http://msm.ishare-go.com', //master分支 ==> 请求基地址
    // timeout: 3000,//请求超时时长
    // url: '/url',//请求路径
    // method: 'get,post,put,patch,delete',//请求方法
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    }, //请求头
    // params: {},//请求参数拼接在url上面
    // data: {},//请求参数放请求体里
})
Vue.prototype.$axios = instance
Vue.prototype.$url= baseURL   //图片路径前缀  发布时需要修改
axios.defaults.baseURL = '/api' //关键代码
Vue.config.productionTip = false
// axios.defaults.withCredentials = true;//1
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
// axios.defaults.baseURL = 'http://msmtest.ishare-go.com'
// axios.defaults.baseURL = 'http://testapi.ishare-go.com'
// axios.defaults.baseURL = 'http://msmtest.com'
// axios.defaults.baseURL = '/api'

// 添加请求拦截器
instance.interceptors.request.use(function (config) {
    if (config.url != '/platformapi/system/albumList') {
        showLoading();
    }
    // if (localStorage.getItem("user_token")) {
    //     config.headers.common['user_token'] = localStorage.getItem("user_token")
    // }
    //请求头转换为表单形式
    // config.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8'
    config.transformRequest = [function (data) {
        // 在请求之前对data传参进行格式转换
        data = qs.stringify(data)
        return data
    }]
    return config
}, function (error) {
    return Promise.reject(error)
})


router.beforeEach((to, from, next) => {

    // console.log(to, 'aa')
    // console.log(from, 'bb')
    if (to.path.indexOf('/login') > -1) {
        next()
        return;
    }
    if (to.path.indexOf('/403') > -1) {
        next()
        return;
    }
    if (to.path.indexOf('/404') > -1) {
        next()
        return;
    }
    // if (localStorage.getItem('url')) {
    //     let urlArr = localStorage.getItem('url').split(',');
    //     console.log(urlArr.includes(to.path), 'urlArr.includes(to.path)')
    //     if (!urlArr.includes(to.path)) {
    //         next({
    //             path: '/403',
    //         })
    //         return
    //     }
    // }
    // if (to.meta.requireAuth) { // 判断该路由是否需要登录权限
    console.log(localStorage.getItem("user_token"), 'popopopo')
    if (localStorage.getItem("user_token")) { // 判断本地是否存在token
        console.log('1')
        next()
    } else {
        // 未登录,跳转到登陆页面
        // next({
        //     path: '/login'
        // })
        // let href = localStorage.getItem('loginHref');
        // location.href = href;
        // localStorage.clear();
        // next()
        if (localStorage.getItem('loginHref')) {
            console.log('2')
            let href = localStorage.getItem('loginHref');
            location.href = href;
            localStorage.clear();
        } else {
            console.log('3')
            next({
                path: '/login',
            })
        }
    }

});

/* 请求之后的操作 */
instance.interceptors.response.use((res) => {
    if (res.data.code == -888888) {
        if (localStorage.getItem('loginHref')) {
            console.log('2')
            let href = localStorage.getItem('loginHref');
            location.href = href;
            localStorage.clear();
        } else {
            console.log('3')
            next({
                path: '/login',
            })
        }
    }
    // console.log(res.data.code, '响应拦截1')
    if (res.data.code == -999999) {
        // console.log(res, '响应拦截2')
        console.log(Vue, 'Vue')
        Vue.prototype.$message.warning('没有操作权限')
        router.push({
            path: '/403'
        })
    }
    hideLoading();
    // console.log(res, '响应拦截3')
    return res;
}, (err) => {
    hideLoading();
    return Promise.reject(err);
});

new Vue({
    router,
    i18n,
    render: h => h(App)
}).$mount('#app');