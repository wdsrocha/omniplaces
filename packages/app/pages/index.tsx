import Head from 'next/head'
import React, { useEffect, useState } from 'react'
import { CircularProgress, TextField } from '@material-ui/core'
import Autocomplete from '@material-ui/lab/Autocomplete'

const BASE_URL = 'https://fb0c64af9d81.ngrok.io'
// const BASE_URL = 'http://localhost:2000'

interface Address {
  street?: string
  number?: string
  neighborhood?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
}

interface MatchInterval {
  offset: number
  length: number
}

interface AddressSuggestion {
  id: string
  description: string
  mainText: string
  mainTextMatchInterval: MatchInterval
  secondaryText: string
}

interface SuggestAddressesResponse {
  suggestions: AddressSuggestion[]
}

const DEBOUNCE_DELAY_IN_MS = 500

const useDebouncedValue = (value: string, delayInMs: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delayInMs)
    return () => {
      clearTimeout(handler)
    }
  }, [value, delayInMs])

  return debouncedValue
}

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init)
  if (!response.ok) {
    throw new Error(response.statusText)
  }
  return response.json() as Promise<T>
}

export const Home = () => {
  const [input, setInput] = useState('')
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<AddressSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const debouncedSearchTerm = useDebouncedValue(input, DEBOUNCE_DELAY_IN_MS)
  const [geolocation, setGeolocation] = useState('')
  const [selectedAddress, setSelectedAddress] = useState<Address>({})

  useEffect(() => {
    if (input.trim().length) {
      setLoading(true)
    } else {
      setOpen(false)
    }
  }, [input])

  useEffect(() => {
    let canceled = false
    if (!loading) {
      return
    }
    ;(async () => {
      if (debouncedSearchTerm.trim().length) {
        setLoading(true)
        if (!geolocation) {
          navigator.geolocation.getCurrentPosition(
            ({ coords: { longitude, latitude } }) =>
              setGeolocation(`${latitude},${longitude}`)
          )
        }
        const url = `${BASE_URL}/suggest?q=${encodeURI(debouncedSearchTerm)}`
        const response = await api<SuggestAddressesResponse>(url, {
          headers: { geolocation },
        })
        if (!canceled) {
          setOptions(response.suggestions)
        }
        setLoading(false)
      }
    })()
    return () => {
      canceled = true
    }
  }, [debouncedSearchTerm])

  useEffect(() => {
    if (!open) {
      setOptions([])
    }
  }, [open])

  const handleChange = async (
    _event: React.ChangeEvent<{}>,
    value: AddressSuggestion
  ) => {
    if (!value) {
      setSelectedAddress({})
      return
    }
    const url = `${BASE_URL}/lookup/${value.id}`
    const response = await api<Address>(url, { headers: { geolocation } })
    setSelectedAddress(response)
  }

  return (
    <>
      <Head>
        <title>Omniplaces</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body>
        <section>
          <Autocomplete
            onChange={handleChange}
            freeSolo
            open={open}
            onOpen={() => {
              setOpen(true)
            }}
            onClose={() => {
              setOpen(false)
            }}
            getOptionSelected={(option, value) =>
              option.description === value.description
            }
            getOptionLabel={(option) => option.description}
            inputValue={input}
            onInputChange={(event: React.ChangeEvent<{}>, value: string) => {
              setInput(value)
            }}
            options={options}
            loading={loading}
            loadingText="Carregando..."
            renderInput={(params) => (
              <TextField
                {...params}
                label="Endereço e número"
                variant="outlined"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      {loading ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </React.Fragment>
                  ),
                }}
              />
            )}
          />
          <pre>{JSON.stringify(selectedAddress, null, 2)}</pre>
        </section>
      </body>
    </>
  )
}

export default Home
