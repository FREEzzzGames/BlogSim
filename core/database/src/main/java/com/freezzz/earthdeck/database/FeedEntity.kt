package com.freezzz.earthdeck.database
import androidx.room.*
@Entity(tableName="feed_snapshots",indices=[Index("groupKey"),Index("fetchedAt")]) data class FeedEntity(@PrimaryKey val groupKey:String,val source:String,val payload:String,val fetchedAt:Long,val expiresAt:Long)
@Dao interface FeedDao{@Query("SELECT * FROM feed_snapshots WHERE groupKey=:key LIMIT 1") suspend fun get(key:String):FeedEntity?;@Insert(onConflict=OnConflictStrategy.REPLACE) suspend fun put(entity:FeedEntity);@Query("DELETE FROM feed_snapshots WHERE expiresAt < :now") suspend fun prune(now:Long):Int}
@Database(entities=[FeedEntity::class],version=1,exportSchema=true) abstract class DeckDatabase:RoomDatabase(){abstract fun feedDao():FeedDao}
