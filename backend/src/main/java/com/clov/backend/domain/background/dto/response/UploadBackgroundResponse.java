package com.clov.backend.domain.background.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UploadBackgroundResponse{
    private String presignedUrl;
}