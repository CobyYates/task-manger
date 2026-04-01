export default defineNuxtRouteMiddleware(async (to) => {
  const { currentUser, waitForAuth } = useAuth()

  await waitForAuth()

  const publicPages = ['/login', '/register']
  const isPublic = publicPages.includes(to.path)

  if (!currentUser.value && !isPublic) {
    return navigateTo('/login')
  }

  if (currentUser.value && isPublic) {
    return navigateTo('/')
  }

  return undefined
})
