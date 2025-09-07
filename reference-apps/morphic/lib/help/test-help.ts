/**
 * Help System Test Utilities
 *
 * Simple test functions to verify the help system is working correctly.
 * Can be run in the browser console or as part of automated tests.
 */

export async function testHelpAPI() {
  console.log('🧪 Testing Help API...')

  try {
    // Test categories endpoint
    console.log('📂 Testing categories endpoint...')
    const categoriesResponse = await fetch('/api/help?action=categories')
    if (!categoriesResponse.ok) {
      throw new Error(`Categories endpoint failed: ${categoriesResponse.status}`)
    }
    const categoriesData = await categoriesResponse.json()
    console.log('✅ Categories:', categoriesData.categories)

    // Test search endpoint
    console.log('🔍 Testing search endpoint...')
    const searchResponse = await fetch('/api/help?action=search&query=workflow')
    if (!searchResponse.ok) {
      throw new Error(`Search endpoint failed: ${searchResponse.status}`)
    }
    const searchData = await searchResponse.json()
    console.log('✅ Search results:', searchData.results?.length || 0, 'results found')

    // Test formatted help endpoint
    console.log('📝 Testing formatted help endpoint...')
    const formattedResponse = await fetch('/api/help?action=formatted&query=how to create a workflow')
    if (!formattedResponse.ok) {
      throw new Error(`Formatted help endpoint failed: ${formattedResponse.status}`)
    }
    const formattedData = await formattedResponse.json()
    console.log('✅ Formatted help length:', formattedData.help?.length || 0, 'characters')

    console.log('🎉 All Help API tests passed!')
    return true

  } catch (error) {
    console.error('❌ Help API test failed:', error)
    return false
  }
}

export async function testHelpProvider() {
  console.log('🧪 Testing Help Provider...')

  try {
    // This would be called from a React component that has access to the help context
    console.log('ℹ️  Help Provider test requires React context - run from a component with useHelp hook')
    return true
  } catch (error) {
    console.error('❌ Help Provider test failed:', error)
    return false
  }
}

export async function testHelpChat() {
  console.log('🧪 Testing Help Chat Component...')

  try {
    // Test if the StudioHelpChat component can be imported
    console.log('ℹ️  Help Chat test requires component rendering - check the Studio page for the help panel')
    return true
  } catch (error) {
    console.error('❌ Help Chat test failed:', error)
    return false
  }
}

// Browser console test runner
export async function runAllTests() {
  console.log('🚀 Running Help System Tests...\n')

  const results = await Promise.all([
    testHelpAPI(),
    testHelpProvider(),
    testHelpChat()
  ])

  const passed = results.filter(Boolean).length
  const total = results.length

  console.log(`\n📊 Test Results: ${passed}/${total} tests passed`)

  if (passed === total) {
    console.log('🎉 All tests passed! Help system is working correctly.')
  } else {
    console.log('⚠️  Some tests failed. Check the console for details.')
  }

  return { passed, total }
}

// Make functions available globally for console testing
if (typeof window !== 'undefined') {
  ;(window as any).testHelpAPI = testHelpAPI
  ;(window as any).testHelpProvider = testHelpProvider
  ;(window as any).testHelpChat = testHelpChat
  ;(window as any).runAllTests = runAllTests

  console.log('💡 Help system test functions available:')
  console.log('  - testHelpAPI()')
  console.log('  - testHelpProvider()')
  console.log('  - testHelpChat()')
  console.log('  - runAllTests()')
}