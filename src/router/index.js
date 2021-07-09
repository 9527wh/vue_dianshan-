import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import Won from '../components/Won.vue'
import Users from '../components/user/Users.vue'


Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: 'Login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/won',
    children: [
      {
        path: '/won',
        component: Won,
      },
      {
        path: '/users',
        component: Users,
      },

    ]
  },



]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  //to 将要去的路径
  //from 从哪里来
  //next 放行
  if (to.path === '/login') return next()
  //获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})
export default router
