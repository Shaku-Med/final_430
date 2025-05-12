import { NextRequest, NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import { CreatePassword, GenerateId, VerifyPassword } from '@/app/Auth/Lock/Password'
import db from '@/app/Database/Supabase/Base1'
import IsAuth from '@/app/Auth/IsAuth/IsAuth';
import { DecryptCombine, EncryptCombine } from '@/app/Auth/Lock/Combine';
import { getClientIP } from '@/app/Auth/IsAuth/SetToken';

interface Blocked {
    ip: string;
    au: string;
    attempt: number;
    limit: number;
    expire: string;
}

async function updateBlockedAttempts(admin: any, ip: string, au: string) {
    let dat = new Date()
    let existingBlock = admin?.blocked?.find((a: Blocked) => a.au === au)
    let updatedBlocked = [...(admin?.blocked || [])]
    
    if (existingBlock) {
        updatedBlocked = updatedBlocked.map((block: Blocked) => {
            if (block.au === au) {
                return {
                    ...block,
                    attempt: block.attempt + 1,
                    expire: dat.setHours(dat.getHours() + 24)
                }
            }
            return block
        })
    } else {
        updatedBlocked.push({
            ip: ip,
            au: au,
            attempt: 1,
            limit: 5,
            expire: dat.setHours(dat.getHours() + 24)
        })
    }

    // Determine which table to update based on the admin object
    const table = admin?.user_id ? 'admin_keys' : 'admin_pass'
    
    let { data: d, error: e } = await db.from(table).update({
        blocked: updatedBlocked
    }).eq('id', admin?.id)

    return { error: e }
}

export async function POST(req: NextRequest) {
  try {
    let h = await headers()
    let c = await cookies()
    const user = await IsAuth(true);
    let ip = await getClientIP(h)
    let userAgent = h.get('user-agent')
    if (!userAgent) {
      return NextResponse.json({
        success: false,
        message: `Invalid request.`
      }, { status: 400 })
    }
    let au = userAgent.split('-').join('')
    if (!user || typeof user === 'boolean' || !('user_id' in user)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json()
    const { password, _at, newPassword } = body
    
    if (!password || !_at) {
        return NextResponse.json({ 
            success: false, 
            message: `Your access was denied.`
        }, { status: 400 })
    }

    let atV = DecryptCombine(_at, [`${process.env.ADMIN_TOKEN_1}`, `${process.env.ADMIN_TOKEN_2}`]);
    if(!atV) {
      return NextResponse.json({ 
        success: false, 
        message: `Request Denied!.`
      }, { status: 400 })
    }

    let {data, error} = await db.from('admin_keys').select('*').eq('user_id', user.user_id).maybeSingle()

    if(error) {
      return NextResponse.json({ 
        success: false, 
        message: `Request Denied!.`
      }, { status: 400 })
    }

    if(data){
        if(data?.blocked){
            if(!ip || !au) {
                return NextResponse.json({
                    success: false,
                    message: `Request wasn't allowed.`
                }, { status: 400 })
            }

            let f: Blocked = data?.blocked?.find((a: Blocked) => a.au === au && a.attempt >= a.limit)
            if(f){
                if(f.expire) {
                    if(new Date() < new Date(f.expire)){
                        return NextResponse.json({
                            success: false,
                            message: `Too many tries.`
                        }, { status: 400 })
                    }
                    else {
                        let {data: d, error: e} = await db.from('admin_keys').update({
                            blocked: data?.blocked?.filter((a: Blocked) => a.au !== au)
                        }).eq('id', data?.id)

                        if(e) {
                            return NextResponse.json({
                                success: false,
                                message: `Request Denied!.`
                            }, { status: 400 })
                        }
                    }
                }
                else {
                    return NextResponse.json({
                        success: false,
                        message: `Too many tries.`
                    }, { status: 400 })
                }
            }
        }
        let v1 = await VerifyPassword(`${password}`, `${data?.password}`)
        if(!v1){

            let { error: e } = await updateBlockedAttempts(data, ip, au)
            if (e) {
                return NextResponse.json({
                    success: false,
                    message: `Request Denied!.`
                }, { status: 400 })
            }

            return NextResponse.json({
                success: false,
                message: `Invalid Password!`
            }, { status: 400 })
        }

        let t = EncryptCombine(`${data.id}`, [`${process.env.ADMIN_LOGIN}`, `${au}`], {
           expiresIn: '1d',
           algorithm: 'HS512'
        })
        
        if (t) {
            c.set('admin', t, { path: '/' })
        }

        return NextResponse.json({
            success: true,
            message: `Authentication successful!`
        }, { status: 200 })
    }
    else {
        let {data: admin, error: e} = await db.from('admin_pass')
          .select('*')
          .order('created_at', { ascending: false })
          .single()

        if(e) {
            return NextResponse.json({ 
                success: false, 
                message: `Request Denied!.`
            }, { status: 400 })
        }

        if(admin?.blocked){
            // 
            if(!ip || !au) {
                return NextResponse.json({
                    success: false,
                    message: `Request wasn't allowed.`
                }, { status: 400 })
            }

            let f: Blocked = admin?.blocked?.find((a: Blocked) => a.au === au && a.attempt >= a.limit)
            if(f){
                if(f.expire) {
                    if(new Date() < new Date(f.expire)){
                        return NextResponse.json({
                            success: false,
                            message: `Too many tries.`
                        }, { status: 400 })
                    }
                    else {
                        let {data: d, error: e} = await db.from('admin_keys').update({
                            blocked: admin?.blocked?.filter((a: Blocked) => a.au !== au)
                        }).eq('id', admin?.id)

                        if(e) {
                            return NextResponse.json({
                                success: false,
                                message: `Request Denied!.`
                            }, { status: 400 })
                        }
                    }
                }
                else {

                    return NextResponse.json({
                        success: false,
                        message: `Too many tries.`
                    }, { status: 400 })
                }
            }
        }

        let pass = `${process.env.ADMIN_PASS}`
        let slicedPass = password.slice(0, 5)
        let v1 = await VerifyPassword(`${slicedPass}`, `${pass}`)
        if (!v1) {
            let { error: e } = await updateBlockedAttempts(admin, ip, au)
            if (e) {
                return NextResponse.json({
                    success: false,
                    message: `Request Denied!.`
                }, { status: 400 })
            }

            return NextResponse.json({
                success: false,
                message: `Invalid Password!`
            }, { status: 400 })
        }

        let slicedPass2 = password.slice(5)
        let v2 = await VerifyPassword(`${slicedPass2}`, `${admin.key}`)
        if(!v2){
            let { error: e } = await updateBlockedAttempts(admin, ip, au)
            if (e) {
                return NextResponse.json({
                    success: false,
                    message: `Something went wrong!.`
                }, { status: 400 })
            }

            return NextResponse.json({
                success: false,
                message: `Invalid Password!`
            }, { status: 400 })
        }

        if(newPassword){
            let newP =await CreatePassword(`${newPassword}`)
            let {data: np, error: ne} = await db.from('admin_keys').insert({
                user_id: user.user_id,
                created_at: new Date().toISOString(),
                password: newP
            }).eq(`user_id`, user.user_id).select('*').single()

            if(ne || !np?.id){
                return NextResponse.json({
                    success: false,
                    message: `Unable to create a password for you..`
                }, { status: 400 })
            }

            let t = EncryptCombine(`${np.id}`, [`${process.env.ADMIN_LOGIN}`, `${au}`], {
                expiresIn: '1d',
                algorithm: 'HS512'
            })
            
            if (t) {
                c.set('admin', t, { path: '/' })
            }

            return NextResponse.json({
                success: true,
                message: `Password created successfully!`,
            }, { status: 200 })
        }

        return NextResponse.json({
            success: true,
            message: `Authentication successful!`,
            action: 'create'
        }, { status: 200 })
    }

  } catch (error) {
    console.error('Admin auth error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 })
  }
} 