package handlers

import (
	"context"
	"encoding/json"
	"logs-server/internal/config"
	"logs-server/internal/models"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type LogResponse struct {
	ID       string `json:"id"`
	Titre    string `json:"titre"`
	Metadata string `json:"metadata"`
	CreateAt string `json:"createAt"`
}

type LogsResponse struct {
	Logs  []LogResponse `json:"logs"`
	Total int64         `json:"total"`
}

func GetLogs(c *gin.Context) {
	db := config.GetDB()

	limitStr := c.DefaultQuery("limit", "10")
	offsetStr := c.DefaultQuery("offset", "0")
	search := c.Query("search")

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 10
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}

	var logs []models.Log
	var total int64

	query := db.Model(&models.Log{})

	if search != "" {
		query = query.Where("LOWER(titre) LIKE LOWER(?)", "%"+search+"%")
	}

	query.Count(&total)

	err = query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&logs).Error
	if err != nil {
		c.JSON(500, gin.H{"error": "Erreur lors de la récupération des logs"})
		return
	}

	var logResponses []LogResponse
	for _, log := range logs {
		metadataStr := "{}"
		if log.Metadata != nil {
			if metadataBytes, err := json.Marshal(log.Metadata); err == nil {
				metadataStr = string(metadataBytes)
			}
		}

		logResponses = append(logResponses, LogResponse{
			ID:       strconv.FormatUint(uint64(log.ID), 10),
			Titre:    log.Titre,
			Metadata: metadataStr,
			CreateAt: log.CreatedAt.Format(time.RFC3339),
		})
	}

	response := LogsResponse{
		Logs:  logResponses,
		Total: total,
	}

	c.JSON(200, response)
}

func GetLogById(c *gin.Context) {
	db := config.GetDB()
	redisClient := config.GetRedisClient()
	id := c.Param("id")

	logID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		c.JSON(400, gin.H{"error": "ID de log invalide"})
		return
	}

	cacheKey := "log:" + id
	cachedLog, err := redisClient.Get(context.Background(), cacheKey).Result()
	if err == nil {
		var response LogResponse
		if err := json.Unmarshal([]byte(cachedLog), &response); err == nil {
			c.JSON(200, response)
			return
		}
	}

	var log models.Log
	err = db.First(&log, logID).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "Log non trouvé"})
		} else {
			c.JSON(500, gin.H{"error": "Erreur lors de la récupération du log"})
		}
		return
	}

	metadataStr := "{}"
	if log.Metadata != nil {
		if metadataBytes, err := json.Marshal(log.Metadata); err == nil {
			metadataStr = string(metadataBytes)
		}
	}

	response := LogResponse{
		ID:       strconv.FormatUint(uint64(log.ID), 10),
		Titre:    log.Titre,
		Metadata: metadataStr,
		CreateAt: log.CreatedAt.Format(time.RFC3339),
	}

	if responseBytes, err := json.Marshal(response); err == nil {
		redisClient.Set(context.Background(), cacheKey, string(responseBytes), time.Hour)
	}

	c.JSON(200, response)
}
