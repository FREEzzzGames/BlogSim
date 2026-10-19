package com.freezzz.earthdeck
import android.os.Bundle
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.freezzz.earthdeck.ui.DeckHome
import com.freezzz.earthdeck.design.BrutalTheme
import dagger.hilt.android.AndroidEntryPoint
@AndroidEntryPoint class MainActivity:ComponentActivity(){override fun onCreate(savedInstanceState:Bundle?){super.onCreate(savedInstanceState);window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);WindowCompat.setDecorFitsSystemWindows(window,false);WindowInsetsControllerCompat(window,window.decorView).hide(WindowInsetsCompat.Type.systemBars());setContent{BrutalTheme{DeckHome()}}}}
