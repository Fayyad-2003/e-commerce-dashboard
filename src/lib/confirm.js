import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

/**
 * Custom confirmation dialog using SweetAlert2
 * @param {Object} options 
 * @param {string} options.title - The title of the dialog
 * @param {string} options.text - The main text of the dialog
 * @param {string} options.confirmButtonText - Text for the confirm button
 * @param {string} options.cancelButtonText - Text for the cancel button
 * @param {string} options.icon - SweetAlert2 icon type (warning, error, success, info, question)
 * @returns {Promise<boolean>} - Resolves to true if confirmed, false otherwise
 */
export const showConfirm = async ({
    title = "هل أنت متأكد؟",
    text = "لا يمكن التراجع عن هذا الإجراء!",
    confirmButtonText = "نعم، احذف",
    cancelButtonText = "إلغاء",
    icon = "warning"
} = {}) => {
    const result = await MySwal.fire({
        title,
        text,
        icon,
        showCancelButton: true,
        confirmButtonColor: '#171717', // Matching the app text color for a sleek look
        cancelButtonColor: '#888',
        confirmButtonText,
        cancelButtonText,
        reverseButtons: true, // RTL typical pattern
        customClass: {
            popup: 'font-cairo', // Assuming Cairo font is available via class
        },
        background: '#FFF8F0', // Matching app background
        color: '#171717',
    });

    return result.isConfirmed;
};
