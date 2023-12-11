import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/ShareCard',
      name: 'ShareCard',
      props: route => {
        const querys:{[index:string]:any} = {}
        Object.keys(route.query).forEach(key => {
          querys[key] = decodeURIComponent(decodeURIComponent( route.query[key] as string ))
        })
        console.log(querys)
        return querys
      },
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/ShareCard.vue')
    }
  ]
})

export default router
