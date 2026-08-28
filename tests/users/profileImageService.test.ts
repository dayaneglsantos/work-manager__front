import {
  removeProfileImage,
  uploadProfileImage
} from '@/services/userServices'
import axios from 'axios'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { server } from '../mocks/server'

describe('profile image service', () => {
  it('solicita a assinatura, envia a imagem e confirma o upload', async () => {
    const file = new File(['profile-image'], 'avatar.webp', {
      type: 'image/webp'
    })
    const cloudinaryPost = vi.spyOn(axios, 'post').mockResolvedValue({
      data: {
        bytes: 13,
        format: 'webp',
        public_id: 'work-manager/avatar-id',
        resource_type: 'image',
        signature: 'cloudinary-response-signature',
        version: 1_787_000_001
      }
    })

    server.use(
      http.post(
        'http://localhost:3000/users/10/profile-image/signature',
        () =>
          HttpResponse.json({
            apiKey: 'public-api-key',
            cloudName: 'test-cloud',
            signature: 'upload-signature',
            timestamp: 1_787_000_000,
            uploadPreset: 'work_manager_profile_images_dev'
          })
      ),
      http.put(
        'http://localhost:3000/users/10/profile-image',
        async ({ request }) => {
          expect(await request.json()).toEqual({
            bytes: 13,
            format: 'webp',
            publicId: 'work-manager/avatar-id',
            resourceType: 'image',
            signature: 'cloudinary-response-signature',
            version: 1_787_000_001
          })

          return HttpResponse.json({
            id: 10,
            profileImage:
              'https://res.cloudinary.com/test-cloud/image/upload/avatar.webp'
          })
        }
      )
    )

    await expect(uploadProfileImage(10, file)).resolves.toEqual({
      id: 10,
      profileImage:
        'https://res.cloudinary.com/test-cloud/image/upload/avatar.webp'
    })

    expect(cloudinaryPost).toHaveBeenCalledWith(
      'https://api.cloudinary.com/v1_1/test-cloud/image/upload',
      expect.any(FormData)
    )

    const formData = cloudinaryPost.mock.calls[0][1] as FormData
    expect(formData.get('file')).toBe(file)
    expect(formData.get('api_key')).toBe('public-api-key')
    expect(formData.get('timestamp')).toBe('1787000000')
    expect(formData.get('upload_preset')).toBe(
      'work_manager_profile_images_dev'
    )
    expect(formData.get('signature')).toBe('upload-signature')
  })

  it('remove a imagem de perfil pelo endpoint do usuário', async () => {
    server.use(
      http.delete('http://localhost:3000/users/10/profile-image', () =>
        HttpResponse.json({ id: 10, profileImage: null })
      )
    )

    await expect(removeProfileImage(10)).resolves.toEqual({
      id: 10,
      profileImage: null
    })
  })
})
