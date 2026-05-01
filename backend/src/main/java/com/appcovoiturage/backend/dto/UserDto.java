package com.appcovoiturage.backend.dto;

import com.appcovoiturage.backend.entity.Role;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserDto {
    private Long id;
    private String firstname;
    private String lastname;
    private String email;
    private Integer pointBalance;
    private Integer totalPointsEarned;
    private Role role;
}
