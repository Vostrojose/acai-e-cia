import { asyncHandler } from '../utils/asyncHandler';
import authService from '../services/auth.service';
class AuthController {
    login = asyncHandler(async (request, response) => {
        const { email, senha } = request.body;
        const result = await authService.login(email, senha);
        return response.json({
            success: true,
            data: result,
        });
    });
}
export default new AuthController();
