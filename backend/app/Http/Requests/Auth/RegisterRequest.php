<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'first_name' => 'required|string|min:2|max:100',
            'last_name'  => 'required|string|min:2|max:100',
            'email'      => 'required|email:rfc,dns|unique:users,email|max:191',
            'phone'      => 'nullable|string|regex:/^(\+212|0)[5-7]\d{8}$/|unique:users,phone',
            'password'   => 'required|string|min:8|max:128|confirmed',
            'role'       => 'nullable|in:client,owner',
            'locale'     => 'nullable|in:ar,fr',
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique'   => 'هذا البريد الإلكتروني مسجل مسبقاً.',
            'phone.unique'   => 'رقم الهاتف مسجل مسبقاً.',
            'phone.regex'    => 'رقم الهاتف غير صحيح. استخدم صيغة المغرب (+212 أو 0XXXXXXXXX).',
            'password.min'   => 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.',
            'password.confirmed' => 'كلمة المرور غير متطابقة.',
        ];
    }
}
