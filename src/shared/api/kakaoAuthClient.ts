import axios from 'axios'

const KAKAO_AUTH_BASE_URL = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI

export const kakaoAuthClient = axios.create({
  baseURL: KAKAO_AUTH_BASE_URL,
})
