/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

router.get('/', () => {
  return { hello: 'world' }
})

router
  .group(() => {
    router.post('merge', [() => import('#controllers/merge_controller'), 'handle'])
    router.post('split', [() => import('#controllers/split_controller'), 'handle'])
    router.post('compress', [() => import('#controllers/compress_controller'), 'handle'])
    router.post('jpg-to-pdf', [() => import('#controllers/jpg_to_pdf_controller'), 'handle'])
    router.post('organize', [() => import('#controllers/organize_controller'), 'handle'])
    router.post('sign', [() => import('#controllers/sign_controller'), 'handle'])
    
    router
      .group(() => {
        router.post('signup', [controllers.NewAccount, 'store'])
        router.post('login', [controllers.AccessTokens, 'store'])
      })
      .prefix('auth')
      .as('auth')

    router
      .group(() => {
        router.get('profile', [controllers.Profile, 'show'])
        router.post('logout', [controllers.AccessTokens, 'destroy'])
      })
      .prefix('account')
      .as('profile')
      .use(middleware.auth())
  })
  .prefix('/api/v1')
