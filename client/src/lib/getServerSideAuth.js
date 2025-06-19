import { verify } from 'jsonwebtoken';
import cookie from 'cookie';

export async function getServerSideProps(context) {
  const { req } = context;
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.token || '';

  try {
    const decoded = verify(token, process.env.JWT_SECRET);
    return {
      props: {
        userId: decoded.id, 
      },
    };
  } catch (err) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
}
