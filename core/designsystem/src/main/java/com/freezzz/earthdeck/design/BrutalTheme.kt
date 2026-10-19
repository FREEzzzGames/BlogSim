package com.freezzz.earthdeck.design
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
val DeckBlack=Color(0xFF000000);val DeckPanel=Color(0xFF080808);val DeckBorder=Color(0xFF262626);val DeckAmber=Color(0xFFFFB703)
@Composable fun BrutalTheme(content:@Composable ()->Unit){MaterialTheme(colorScheme=darkColorScheme(primary=Color.White,onPrimary=Color.Black,background=DeckBlack,onBackground=Color.White,surface=DeckPanel,onSurface=Color.White,error=Color(0xFFFF4242)),content=content)}
