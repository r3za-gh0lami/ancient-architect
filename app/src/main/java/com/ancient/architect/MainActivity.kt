package com.ancient.architect

import android.annotation.SuppressLint
import android.graphics.Color
import android.os.Bundle
import android.view.View
import android.view.WindowManager
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Keep screen on during focus sessions
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

        // Set status bar color to match dark Persian slate theme
        window.statusBarColor = Color.parseColor("#090D16")
        window.navigationBarColor = Color.parseColor("#090D16")

        setContentView(R.layout.activity_main)
        webView = findViewById(R.id.webView)

        configureWebView()

        // Load the local packaged web app
        webView.loadUrl("file:///android_asset/www/index.html")

        // Handle back press
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    finish()
                }
            }
        })
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun configureWebView() {
        // Hardware acceleration for fast smooth rendering
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null)
        webView.setBackgroundColor(Color.parseColor("#090D16"))
        webView.isVerticalScrollBarEnabled = false
        webView.isHorizontalScrollBarEnabled = false

        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.allowFileAccess = true
        settings.allowContentAccess = true

        // Cache local packaged assets for instant reload
        settings.cacheMode = WebSettings.LOAD_DEFAULT

        // Crucial for Web Audio and focus ambient playback without user gesture blocking
        settings.mediaPlaybackRequiresUserGesture = false

        settings.useWideViewPort = true
        settings.loadWithOverviewMode = true

        webView.webViewClient = object : WebViewClient() {}
        webView.webChromeClient = object : WebChromeClient() {}
    }

    override fun onResume() {
        super.onResume()
        webView.onResume()
    }

    override fun onPause() {
        super.onPause()
        webView.onPause()
    }

    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }
}
