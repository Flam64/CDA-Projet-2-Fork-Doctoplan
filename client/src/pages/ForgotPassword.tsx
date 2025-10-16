import { ReactNode, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { useSendResetPasswordMutation } from '@/types/graphql-generated';

type FormValues = {
  email: string;
};

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<FormValues>();

  const [sendResetPasswordMutation] = useSendResetPasswordMutation();

  const onSubmit = async (input: FormValues) => {
    setError('');
    try {
      const { data } = await sendResetPasswordMutation({
        variables: { email: { email: input.email } },
      });
      if (data) {
        toast.success("Si l'adresse existe, un mail de réinitialisation à été envoyé");
        setMessage("Si l'adresse existe, un mail de réinitialisation à été envoyé");

        // ⏳ Pause to display the message before redirecting to the login page
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError('Erreur lors de la réinitialisation');
      }
    } catch (error) {
      // an error is sent and we remain on the page
      toast.warning('Impossible de réinitialiser le mot de passe');
      setError(error instanceof Error ? error.message : 'Une erreur inttendue est survenue.');
    }
  };

  return (
    <div
      className="w-full max-w-md px-8 py-10 mx-auto bg-white rounded-lg shadow-sm"
      role="region"
      aria-labelledby="reset-password-title"
    >
      <h1 id="reset-password-title" className="mb-6 text-center">
        Réinitialisation de mot de passe
      </h1>

      {/* 📜 information block or error (error & message)*/}
      {error && (
        <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
          {error}
        </div>
      )}

      {message && (
        <p className="p-2 mb-4 text-sm text-lime-600" role="alert">
          ✅{message}
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label htmlFor="email" className="block mb-2 text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register('email', {
              required: "⚠️ L'email est obligatoire",
              pattern: {
                value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/, // 🔥 le regEx definitif devra être /^[a-zA-Z0-9._%+-]+@hopital\.gouv\.fr$/
                message: "⚠️ L'email n'est pas valide",
              },
            })}
            placeholder="example@email.com"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : 'email-help'}
          />
          {/* 📌 Hidden help for screen readers*/}
          <p id="email-help" className="sr-only">
            Saisissez votre adresse e-mail pour recevoir un lien de réinitialisation.
          </p>

          {errors.email?.message && (
            <p id="email-error" className="text-sm text-accent" role="alert">
              {errors.email.message as ReactNode}
            </p>
          )}
        </div>

        <div className="mb-6 text-right">
          <Link
            to="/login"
            className="text-sm text-accent hover:text-accent-500 transition duration-200 ease-in-out"
          >
            Retour a la page login
          </Link>
        </div>

        <button
          type="submit"
          className="cta block mx-auto"
          aria-label="Envoyer un email de réinitialisation du mot de passe"
        >
          Continuer
        </button>
      </form>
    </div>
  );
}
