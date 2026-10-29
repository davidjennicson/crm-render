package com.hokma.auth.demo.auth.service.impl;

import com.hokma.auth.demo.auth.dto.UserDto;
import com.hokma.auth.demo.auth.entity.Provider;
import com.hokma.auth.demo.auth.entity.User;
import com.hokma.auth.demo.auth.repository.UserRepository;
import com.hokma.auth.demo.auth.service.UserService;
import com.hokma.auth.demo.auth.validator.UserValidator;
import com.hokma.auth.demo.shared.exception.ResourceNotFoundException;
import com.hokma.auth.demo.shared.helper.AppHelper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final UserValidator userValidator;

    @Override
    @Transactional
    public UserDto createUser(UserDto userDto) {
        userValidator.validateForCreate(userDto);
        
        User user = modelMapper.map(userDto, User.class);
        user.setProvider(userDto.getProvider() != null ? userDto.getProvider() : Provider.LOCAL);
        User savedUser = userRepository.save(user);
        return modelMapper.map(savedUser, UserDto.class);
    }

    @Override
    public UserDto getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with given email: " + email));
        return modelMapper.map(user, UserDto.class);
    }

    @Override
    public UserDto getUserById(String userId) {
        UUID uuid = AppHelper.parseUUID(userId);
        User user = userRepository.findById(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        return modelMapper.map(user, UserDto.class);
    }

    @Override
    public Iterable<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> modelMapper.map(user, UserDto.class))
                .toList();
    }

    @Override
    @Transactional
    public UserDto updateUser(UserDto userDto, String userId) {
        userValidator.validateForUpdate(userDto);
        UUID uuid = AppHelper.parseUUID(userId);
        User user = userRepository.findById(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("User not found!"));

        try {
            if (userDto.getName() != null) user.setName(userDto.getName());
            if (userDto.getAddress() != null) user.setAddress(userDto.getAddress());
            if (userDto.getGender() != null) user.setGender(userDto.getGender());
            if (userDto.getProvider() != null) user.setProvider(userDto.getProvider());
            if (userDto.getImage() != null) user.setImage(userDto.getImage());
            if (userDto.getCompanyName() != null) user.setCompanyName(userDto.getCompanyName());
            if (userDto.getIndustry() != null) user.setIndustry(userDto.getIndustry());
            if (userDto.getCompanySize() != null) user.setCompanySize(userDto.getCompanySize());
            if (userDto.getRole() != null) user.setRole(userDto.getRole());
            
            if (userDto.getSetupCompleted() != null) user.setSetupCompleted(userDto.getSetupCompleted());
            if (userDto.getEnable() != null) user.setEnable(userDto.getEnable());
            
            User updatedUser = userRepository.save(user);
            return modelMapper.map(updatedUser, UserDto.class);
        } catch (Exception e) {
            System.err.println("Error updating user: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Override
    @Transactional
    public void deleteUser(String userId) {
        UUID uuid = AppHelper.parseUUID(userId);
        User user = userRepository.findById(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("User not found!"));
        userRepository.delete(user);
    }
}
