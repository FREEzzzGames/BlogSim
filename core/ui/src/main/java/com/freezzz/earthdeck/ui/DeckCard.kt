package com.freezzz.earthdeck.ui
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.freezzz.earthdeck.design.*
@Composable fun DeckCard(title:String,value:String,status:String,modifier:Modifier=Modifier,onClick:()->Unit={}){Column(modifier.border(1.dp,DeckBorder).background(DeckPanel).clickable(onClick=onClick).sizeIn(minHeight=112.dp,minWidth=48.dp).padding(16.dp)){Text(title,color=Color.White,fontSize=12.sp);Spacer(Modifier.height(16.dp));Text(value,color=Color.White,fontSize=28.sp);Spacer(Modifier.height(8.dp));Text(status,color=DeckAmber,fontSize=10.sp)}}
