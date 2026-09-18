package com.hotelix.service.interfac;

import com.hotelix.dto.LoginRequest;
import com.hotelix.dto.Response;
import com.hotelix.entity.User;

public interface IUserService {
    Response register(User user);

    Response login(LoginRequest loginRequest);

    Response getAllUsers();

    Response getUserBookingHistory(String userId);

    Response deleteUser(String userId);

    Response getUserById(String userId);

    Response getMyInfo(String email);

}
