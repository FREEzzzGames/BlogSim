package com.freezzz.earthdeck.common
sealed interface Resource<out T>{data object Loading:Resource<Nothing>;data class Data<T>(val value:T,val cached:Boolean=false):Resource<T>;data class Error<T>(val message:String,val cachedData:T?=null):Resource<T>}
